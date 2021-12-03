import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;
const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader, Basic_Shader, Subdivision_Sphere} = defs

import {Shape_From_File} from './examples/obj-file-demo.js';
import {Text_Line} from './examples/text-demo.js';
import {Color_Phong_Shader, Shadow_Textured_Phong_Shader,
    Depth_Texture_Shader_2D, Buffered_Texture, LIGHT_DEPTH_TEX_SIZE} from './examples/shadow-demo-shaders.js'

var speedCollide = false;
var activeSpeedPowerup = 0;

// 2D shape, to display the texture buffer
const Square =
    class Square extends tiny.Vertex_Buffer {
        constructor() {
            super("position", "normal", "texture_coord");
            this.arrays.position = [
                vec3(0, 0, 0), vec3(1, 0, 0), vec3(0, 1, 0),
                vec3(1, 1, 0), vec3(1, 0, 0), vec3(0, 1, 0)
            ];
            this.arrays.normal = [
                vec3(0, 0, 1), vec3(0, 0, 1), vec3(0, 0, 1),
                vec3(0, 0, 1), vec3(0, 0, 1), vec3(0, 0, 1),
            ];
            this.arrays.texture_coord = [
                vec(0, 0), vec(1, 0), vec(0, 1),
                vec(1, 1), vec(1, 0), vec(0, 1)
            ]
        }
    }


class Maze_Runner {
    constructor(model_info, loc_transform, rm=Mat4.identity(), maze_scale, speed=1, abs_dir='f', dir='s'){
        this.model_info = model_info;
        this.dir = dir;
        this.abs_dir = abs_dir;
        this.speed = speed;
        this.upright_R = rm;
        this.maze_scale = maze_scale;
        this.model_transform = Mat4.rotation(this.getAngle(this.abs_dir),0,1,0).times(loc_transform);
        this.timer = 0;
        this.collide = false;
        this.savedSpeed = speed;
    }
    
    check_bounds(follow){
        //check if out of bounds
        const x = this.model_transform[0][3];
        const z = this.model_transform[2][3];
        const side_to_center = 13.5*this.maze_scale;    
        if (Math.abs(x) > side_to_center){
            this.model_transform = Mat4.identity().times(Mat4.translation(-Math.trunc(x), 0, z));
            if (follow)
                this.updateMatrix(this.getRotationMatrix());
        }

        //TEMPORARY before collision detection
        const top_to_center = -23.25*this.maze_scale;
        const bottom_to_center = 7.25*this.maze_scale;
        if (z > bottom_to_center){
            this.model_transform = Mat4.identity().times(Mat4.translation(x, 0, top_to_center));
            if (follow)
                this.updateMatrix(this.getRotationMatrix());
        }else if (z < top_to_center){
            this.model_transform = Mat4.identity().times(Mat4.translation(x, 0, bottom_to_center));
            if (follow)
                this.updateMatrix(this.getRotationMatrix());
        }
    }

    move(follow, dt){
        const move = -0.1-this.speed*0.05;
        let T = this.getTransMatrix(move, follow);
        this.updateMatrix(T);

        this.check_bounds(follow);

        return this.model_transform;
    }

    speed_collision_helper(speed_transform, my_x, my_z) {
        const speed_x = speed_transform[0][3];
        const speed_z = speed_transform[2][3];

        if ((speed_x >= (my_x - 1)) && (speed_x <= (my_x + 1)) &&
            ((speed_z >= (my_z - 1)) && (speed_z <= (my_z + 1)))) {
            this.collide = true;
        }
    }

    speed_collision_detection() {
        if (activeSpeedPowerup != 0) {
        const my_center = this.model_transform;
        const my_x = my_center[0][3];
        const my_z = my_center[2][3];

        let speed_transform;

        switch (activeSpeedPowerup) {
            case 1:
                    speed_transform = Mat4.translation(-1.5*this.maze_scale,0,4.5*this.maze_scale);
                    this.speed_collision_helper(speed_transform, my_x, my_z);
            case 2:
                    speed_transform = Mat4.translation(1.5*this.maze_scale,0,4.5*this.maze_scale);
                    this.speed_collision_helper(speed_transform, my_x, my_z);
            case 3:
                    speed_transform = Mat4.translation(1.5*this.maze_scale,0,-20*this.maze_scale);
                    this.speed_collision_helper(speed_transform, my_x, my_z);
            case 4:
                    speed_transform = Mat4.translation(-1.5*this.maze_scale,0,-20*this.maze_scale);
                    this.speed_collision_helper(speed_transform, my_x, my_z);
        }

        if (this.collide === true) {
            this.speed = 4;
            this.timer += 1;
            speedCollide = true;
            this.model_info.material.color = hex_color("#00FF00");

            if (this.timer > 200) {
                if (this.timer % 10 === 0) {
                    this.model_info.material.color = hex_color("#FFFF00");
                }
                else
                    this.model_info.material.color = hex_color("#00FF00");
            }

            if (this.timer === 350) {
                this.collide = false;
                this.speed = this.savedSpeed;
                this.timer = 0;
                speedCollide = false;
                this.model_info.material.color = hex_color("#FFFF00");
            }
        }
                }
    }

    collision_detection(arr, type='wall', remove=false){
        //iterate through each wall
        const my_center = this.model_transform;
        const my_x = my_center[0][3];
        const my_z = my_center[2][3];

        let detector;
        switch(type){
            case 'wall':
                detector = (my_x, my_z, obj) => {return this.wall_collision_detection(my_x, my_z, obj)};
                break;
            case 'pellet':
                detector = (my_x, my_z, obj) => {return this.pellet_collision_detection(my_x, my_z, obj, 0.2*this.maze_scale)};
                break;
            case 'invinc_pellet':
                detector = (my_x, my_z, obj) => {return this.pellet_collision_detection(my_x, my_z, obj, 0.5*this.maze_scale)};
                break;
            case 'pacman':
                detector = (my_x, my_z, obj) => {return this.pacman_collision_detection(my_x, my_z, obj)};
                break;
            default:
                console.log('Invalid type');
                break;
            
        }

        for (var i = 0; i < arr.length; i++)
        {
            const obj = arr[i];
            if ( detector(my_x, my_z, obj) ){

                //if pellet, remove from array
                if (remove){
                    arr.splice(i,1);
                }
                    
                return true;
            }
                
        }
        return false;
    }

    pacman_collision_detection(my_x, my_z, pacman){
        let pac_x = pacman.model_transform[0][3];
        let pac_z = pacman.model_transform[2][3];
        const ghost_r = 0.8;
        for (let x=my_x-ghost_r; x <= my_x+ghost_r; x+=2*ghost_r){
            for (let z=my_z-ghost_r; z <= my_z+ghost_r; z+=2*ghost_r){
                if ((x >= (pac_x - 1)) && (x <= (pac_x + 1)) &&
                    ((z >= (pac_z - 1)) && (z <= (pac_z + 1))))
                {
                    return true;
                }
            }
        }
        return false;
    }

    pellet_collision_detection(my_x, my_z, pellet_transform, r){
        pellet_transform = pellet_transform.times(Mat4.inverse(Mat4.scale(r,r,r)))
        let pellet_x = pellet_transform[0][3];
        let pellet_z = pellet_transform[2][3];
        const ghost_r = 0.8;

        if ((pellet_x >= (my_x - 1)) && (pellet_x <= (my_x + 1)) &&
            ((pellet_z >= (my_z - 1)) && (pellet_z <= (my_z + 1))))
        {
            return true;
        }
        return false;
    }

    wall_collision_detection(my_x, my_z, wall){
        let wall_x = wall.center[0][3]*this.maze_scale;
        let wall_z = wall.center[2][3]*this.maze_scale;

        let x_len = this.maze_scale;
        let z_len = this.maze_scale;
        if (wall.vert){
            x_len *= wall.width;
            z_len *= wall.length;
        }else{
            x_len *= wall.length;
            z_len *= wall.width;
        }

        for (let x=my_x-1; x <= my_x+1; x+=2){
            for (let z=my_z-1; z <= my_z+1; z+=2){
                if ((x >= (wall_x - x_len)) && (x <= (wall_x + x_len)) &&
                    ((z >= (wall_z - z_len)) && (z <= (wall_z + z_len))))
                {
                    return true;
                }
            }
        }
    }

    updateMatrix(m){
        this.model_transform = (this.model_transform).times(m);
    }

    getRotationMatrix(){
        return Mat4.rotation(this.getAngle(this.abs_dir),0,1,0);
    }

    getTransMatrix(move, follow=false){
        let T;
        if (follow){
            this.updateMatrix(Mat4.inverse(this.getRotationMatrix()));
            T = this.model_transform;

            this.abs_dir = this.getNewDir();
            if (this.dir !== 's')
                this.dir = 'f';

            this.updateMatrix((this.getRotationMatrix()).times(Mat4.inverse(T)));

            if (this.dir === 'f')
                this.updateMatrix(Mat4.translation(0,0,move));

        }else{
            if (this.dir !== 's')
                this.abs_dir = this.dir;

            switch(this.dir){
                case 'l': T = Mat4.translation(move,0,0);
                    break;
                case 'r': T = Mat4.translation(-move,0,0);
                    break;
                case 'f': T = Mat4.translation(0,0,move);
                    break;
                case 'b': T = Mat4.translation(0,0,-move);
                    break;
                default: T = Mat4.translation(0,0,0);
                    break;
            }
        }
        return T;
    }

    getNewDir(){
        switch(this.abs_dir){
            case 'l':
                switch(this.dir){
                    case 'l': return 'b';
                    case 'r': return 'f';
                    case 'b': return 'r';
                    default: break;
                };
            case 'r':
                switch(this.dir){
                    case 'l': return 'f';
                    case 'r': return 'b';
                    case 'b': return 'l';
                    default: break;
                };
                break;
            case 'b':
                switch(this.dir){
                    case 'l': return 'r';
                    case 'r': return 'l';
                    case 'b': return 'f';
                    default: break;
                };
                break;
            case 'f':
                if (this.dir !== 's')
                    return this.dir;
                break;
            default:
                break;
        };
        return this.abs_dir;
    }

    getAngle(dir){
        let angle;
        switch(dir){
            case 'l': angle = Math.PI/2;
                break;
            case 'r': angle = -Math.PI/2;
                break;
            case 'b': angle = Math.PI;
                break;
            default: angle = 0;
                break;
        };
        return angle;
    }

}

class PacMan extends Maze_Runner {
    constructor(maze_scale, speed=1){
        const model_info = {
            shape: new defs.Subdivision_Sphere(4),//new Shape_From_File("assets/pacman.obj"),
            material: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.8, color: hex_color("#FFFF00")}),
        }
        //PacMan starts at world origin, begin facing forward
        super(model_info, Mat4.identity(), Mat4.identity(), maze_scale, speed, 'f');
    }
}

class Ghost extends Maze_Runner {
    constructor(loc_transform, maze_scale, speed=1){
        const model_info = {
            shape: new Shape_From_File("assets/boo.obj"),
            material: new Material( new defs.Phong_Shader(),
                {ambient: 0.7, color: hex_color("#CCC0C0")}),
        }
        //Ghost starts at world origin, begin facing forward
        super(model_info, loc_transform, Mat4.rotation(Math.PI,0,1,0).times(Mat4.rotation(-Math.PI/6,1,0,0)).times(Mat4.scale(maze_scale/2,maze_scale/2,maze_scale/2)), maze_scale, speed, 's');
        this.turn_dt = 2;
    }

    move(follow, dt){
        let turn_t = 3+Math.random()*4;
        if (this.turn_dt > turn_t || this.dir === 's'){
            this.turn_dt = 0;
            let dir;
            if (this.dir === 's')
                dir = Math.floor(Math.random()*3)+1;
            else
                dir = Math.floor(Math.random()*4);
            switch(dir){
                case 0:
                    this.dir = 'f';
                    break;
                case 1:
                    this.dir = 'l';
                    break;
                case 2:
                    this.dir = 'r';
                    break;
                case 3:
                    this.dir = 'b';
                    break;
                default:
                    break;
            }
            //this.dir = 's'; // DELETE
            //console.log(this.dir);
        }else{
            this.turn_dt += dt;
            //console.log(this.turn_dt);
        }

        super.move(false, dt);
    }
}

const Struct = (...keys) => ((...v) => keys.reduce((o, k, i) => {o[k] = v[i]; return o} , {}));
//center matrix transform, length & width are from center to side
const Wall = Struct('center', 'length', 'width', 'vert');

export class Demo3 extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            cube: new Cube(),
            pacman: new defs.Subdivision_Sphere(4),
            ghost: new defs.Subdivision_Sphere(2),
            pellet: new defs.Subdivision_Sphere(4),
            text: new Text_Line(35),
            square_2d: new Square(),
        };

        // *** Materials
        const texture = new defs.Textured_Phong(1);
        this.materials = {
            wall: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.6, specularity: 0.7, color: hex_color("#4444CC")}),
            pellet: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, color: hex_color("#fff2c7")}),
            invincibility_powerup: new Material(new defs.Phong_Shader(),
                {ambient: 0.5, color: hex_color("#fff2c7")}),
            speed_powerup: new Material(new defs.Phong_Shader(),
                {ambient: 0.3, diffusivity: 1, specularity: 1, color: hex_color("#00FF00")}),
            text_image: new Material(texture,
                {ambient: 1, diffusivity: 0, specularity: 0, texture: new Texture("assets/text.png")}),
            wall_mm: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0, specularity: 0, color: hex_color("#1414e0")}),
            pellet_mm: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0, specularity: 0, color: hex_color("#fff2c7")})
        }

        // For depth texture display
        this.depth_tex =  new Material(new Depth_Texture_Shader_2D(), {
            color: color(0, 0, .0, 1),
            ambient: 1, diffusivity: 0, specularity: 0, texture: null
        });

        this.follow = true;
        this.scale = 2;
        this.score = 0;
        this.score_update_dt = 0;
        this.score_update = false; 
        const speed = this.scale;
        this.invincible_time = 0;
        this.alive = true; 


        this.speed_powerup = false;
        this.speed_powerup_pos1 = false;
        this.speed_powerup_pos2 = false;
        this.speed_powerup_pos3 = false;
        this.speed_powerup_pos4 = false;
        this.scale_factor = 1;
        this.speed_pos_random_number = Math.floor(Math.random() * (Math.floor(4) - Math.ceil(1) + 1) + Math.ceil(1));

        this.pacman = new PacMan(this.scale, speed);
        this.ghost1 = new Ghost(Mat4.translation(0,0,-9.25*this.scale), this.scale, speed);
        this.ghost2 = new Ghost(Mat4.translation(-2*this.scale,0,-9.25*this.scale), this.scale, speed);
        this.ghost3 = new Ghost(Mat4.translation(2*this.scale,0,-9.25*this.scale), this.scale, speed);
        this.runners = [this.pacman, this.ghost1, this.ghost2, this.ghost3];

        this.walls = [];
        this.make_walls(this.scale);

        this.pellets = [];
        this.make_pellets(this.scale);
        
        this.invinc_pellets = [];
        this.make_invincibility_powerups(this.scale);


        this.pov1_matrix = Mat4.translation(0,3,4).times(Mat4.rotation(-Math.PI/12,1,0,0));
        this.pov3 = Mat4.look_at(vec3(0, 35*this.scale, 10*this.scale), vec3(0, 0, -5*this.scale), vec3(0, 0, -1));
        
        // To make sure texture initialization only does once
        this.init_ok = false;
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Forward", ["u"], () => {
            this.pacman.dir = 'f';
            this.score_update = true; 
        });
        this.new_line();
        this.key_triggered_button("Right", ["k"], () => {
            this.pacman.dir = 'r';
            this.score_update = true; 
        });
        //this.new_line();
        this.key_triggered_button("Left", ["h"], () => {
            this.pacman.dir = 'l';
            this.score_update = true; 
        });
        this.new_line();
        this.key_triggered_button("Backward", ["j"], () => {
            this.pacman.dir = 'b';
            this.score_update = true; 
        });
        this.new_line();
        this.key_triggered_button("Stop", ["m"], () => {
            this.pacman.dir = 's';
            this.score_update = false; 
        });
        this.new_line(); this.new_line();
        this.key_triggered_button("Camera POV", ["c"], () => {
            for (let i = 0; i < this.runners.length; ++i) {
                const runner = this.runners[i];
                let R = runner.getRotationMatrix();
                let new_dir;
                if (this.follow){
                    runner.updateMatrix(Mat4.inverse(R));
                    new_dir = runner.abs_dir;
                }else{
                    runner.updateMatrix(R);
                    new_dir = 'f';
                }

                if (runner.dir !== 's')
                    runner.dir = new_dir;
            }
            this.follow ^= 1;
        });
    }

    disp_text(context, program_state, M, str, line_spacing=2){
        const multi_line_string = str.split('\n');
        for (let line of multi_line_string.slice(0, 10)) {             // Assign the string to Text_String, and then draw it.
            this.shapes.text.set_string(line, context.context);
            this.shapes.text.draw(context, program_state, M, this.materials.text_image);
            // Move our basis down a line.
            M.post_multiply(Mat4.translation(0, -line_spacing, 0));
        }
    }
    
    render(context, program_state, map=false){
        this.draw_walls(context, program_state, this.scale, map);
        this.draw_pellets(context, program_state, map);
        
        //const ghost_colors = ["FF8888","",""]
        let dir_R = Mat4.identity();
        for (let i = 0; i < this.runners.length; ++i) {
            const runner = this.runners[i];
            if (!this.follow || i > 0)
                dir_R = runner.getRotationMatrix();

            let material = runner.model_info.material;
            if (i>0 && this.invincible_time > 0)
                material = material.override({color: color(0.25+1/this.invincible_time,0.25+1/this.invincible_time,1,1)});
                
            if (map){
                runner.model_info.shape.draw(context, program_state, runner.model_transform.times(dir_R).times(runner.upright_R), material.override({ambient: 1, specularity: 0, diffusivity: 0}));
            } else {
                
                runner.model_info.shape.draw(context, program_state, runner.model_transform.times(dir_R).times(runner.upright_R), material);
            } 
        }

        var random = Math.floor((Math.random()*10000));
        //console.log(random);
        if (!map){
            // Speed Powerup Generation
            if (this.speed_powerup === false && random % 500 === 0)
                this.speed_powerup_pos_checker();
            this.make_speed_powerup(context, program_state, this.scale);

            const score_transform = program_state.camera_transform.times(Mat4.translation(3.75,3.75,-10)).times(Mat4.scale(0.2, 0.2, 0.2));//(Mat4.rotation(Math.PI/2, -1,0,0));
            this.disp_text(context, program_state, score_transform, "Score: "+String(this.score).padStart(5,'0'));
        }
        
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        const t = program_state.animation_time / 1000.0, dt = program_state.animation_delta_time / 1000;
        // If the score is over some threshold, display game over 
        if (this.score > 10000){
            this.alive = false;   
        }

        if (!this.alive){
            const gameover_transform = program_state.camera_transform.times(Mat4.translation(-3,0, -5)).times(Mat4.scale(0.5, 0.5, 0.5));//(Mat4.rotation(Math.PI/2, -1,0,0));
            this.disp_text(context, program_state, gameover_transform, "GAME OVER");
            this.render(context, program_state);
            return;
        }   

        //if pellet array AND incibility pellet array is empty
        if ((this.pellets === undefined || this.pellets.length == 0) && (this.invinc_pellets === undefined || this.invinc_pellets.length == 0)) {
            const gameover_transform = program_state.camera_transform.times(Mat4.translation(-2.2,0, -5)).times(Mat4.scale(0.5, 0.5, 0.5));//(Mat4.rotation(Math.PI/2, -1,0,0));
            this.disp_text(context, program_state, gameover_transform, "VICTORY");
            this.render(context, program_state);
            return;
        }  

        if (this.score_update){
            this.score_update_dt += dt;
            if (this.score_update_dt >= 1){
                this.score += 1;
                this.score_update_dt = 0;
            }
        }
        const gl = context.context;

        if (!this.init_ok) {
            const ext = gl.getExtension('WEBGL_depth_texture');
            if (!ext) {
                return alert('need WEBGL_depth_texture');  // eslint-disable-line
            }
            this.texture_buffer_init(gl);

            this.init_ok = true;
        }
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            
            // Define the global camera and projection matrices, which are stored in program_state.
            let initial_camera_location;
            if (this.follow)
                initial_camera_location = Mat4.inverse((this.pacman.model_transform).times(this.pov1_matrix));
            else initial_camera_location = this.pov3;

            program_state.set_camera(initial_camera_location);
        }
        

        const light_positions = [vec4(0, 50*this.scale, -10*this.scale, 1)];
        const white = color(1, 1, 1, 1);
        const bright = 5000*this.scale**2;
        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_positions[0], white, bright)];

        // Move runners
        for (let i = 0; i < this.runners.length; ++i) {
            const runner = this.runners[i];

            runner.move(this.follow, dt);

            //ghost collision with pacman
            if (i>0 && runner.collision_detection([this.pacman], 'pacman')){
                if (this.invincible_time > 0){
                    runner.model_transform = Mat4.translation(0,0,-9.25*this.scale);
                    runner.dir = 's';
                }else this.alive = false;
            }

            //walls
            if (runner.collision_detection(this.walls, 'wall')){
                const move = -0.1-runner.speed*0.05;
                let T;
                switch(runner.dir){
                    case 'l': T = Mat4.translation(-move,0,0);
                        break;
                    case 'r': T = Mat4.translation(move,0,0);
                        break;
                    case 'f': T = Mat4.translation(0,0,-move);
                        break;
                    case 'b': T = Mat4.translation(0,0,move);
                        break;
                    default: T = Mat4.translation(0,0,0);
                        break;
                }
                runner.updateMatrix(T);
                runner.dir = 's';
            }

            if (runner.speed_collision_detection()) {
                console.log("hi");
            }
        }

        //pellets
        //console.log(this.invincible_time);
        if (this.pacman.collision_detection(this.pellets, 'pellet', true))
            this.score += 10;
        if (this.pacman.collision_detection(this.invinc_pellets, 'invinc_pellet', true)){
            this.score += 50;
            this.invincible_time += 10;
        }
        this.invincible_time = Math.max(0,this.invincible_time-dt);

        let desired;
        if (this.follow)
            desired = Mat4.inverse((this.pacman.model_transform).times(this.pov1_matrix));
        else
            desired = this.pov3;    //Mat4.inverse((this.pacman.model_transform).times(Mat4.translation(0,50,10)).times(Mat4.rotation(-Math.PI/2,1,0,0)));
            
        desired = desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.15));
        
        // Bind the Depth Texture Buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.viewport(0, 0, this.lightDepthTextureSize, this.lightDepthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        //const smoothed_pacman_view = Mat4.inverse(desired).times(Mat4.inverse(this.pov1_matrix));
        // const view_mat = Mat4.inverse(smoothed_pacman_view.times(Mat4.translation(0,15*this.scale,0)).times(Mat4.rotation(-Math.PI/2,1,0,0)));
        // program_state.view_mat = view_mat;
        let view_mat = Mat4.look_at(vec3(0, 27*this.scale, -7.5*this.scale), vec3(0, 0, -7.5*this.scale), vec3(0, 0, -1));
        program_state.view_mat =  view_mat; 
        program_state.projection_transform = Mat4.perspective(Math.PI / 3, 1, 2, 500);
        //program_state.set_camera(view_mat);
        this.render(context, program_state, true);

        // Step 2: unbind, draw to the canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        program_state.view_mat = desired;
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, .1, 1000);
        program_state.set_camera(desired);
        this.render(context, program_state);

        // Step 3: display the textures
        if (this.follow)
            this.shapes.square_2d.draw(context, program_state,
                Mat4.translation(-.99, .26, 0).times(
                Mat4.scale(0.35, 0.4 * gl.canvas.width / gl.canvas.height, 1)
                ),
                this.depth_tex.override({texture: this.lightDepthTexture})
            );
    }
    
    
    draw_pellets(context, program_state, map=false){
        let pellet_transform;
        for (let i = 0; i < this.pellets.length; i++){
            pellet_transform = this.pellets[i];
            if (map) {
                this.shapes.pellet.draw(context, program_state, pellet_transform, this.materials.pellet_mm);
            } else {
                this.shapes.pellet.draw(context, program_state, pellet_transform, this.materials.pellet);
            }
        }

        for (let i = 0; i < this.invinc_pellets.length; i++){
            pellet_transform = this.invinc_pellets[i];
            if (map){
                this.shapes.pellet.draw(context, program_state, pellet_transform, this.materials.invincibility_powerup.override({ambient: 1, specularity: 0, diffusivity: 0}));
            } else {
                this.shapes.pellet.draw(context, program_state, pellet_transform, this.materials.invincibility_powerup);
            } 
        }
    }
    
    make_invincibility_powerups(scale) {
        const size = 0.5*scale;
        const x_width = 12.5*scale;
        let invincibility_powerup = Mat4.scale(size,size,size);
                
        // Top invincibility powerups
        let powerup_transform = Mat4.translation(x_width,0,0).times(invincibility_powerup);
        let powerup_transform2 = Mat4.translation(-x_width,0,0).times(invincibility_powerup);
        // Bottom invincibility powerups
        let powerup_transform3 = Mat4.translation(x_width,0,-20*scale).times(invincibility_powerup);
        let powerup_transform4 = Mat4.translation(-x_width,0,-20*scale).times(invincibility_powerup);

        this.invinc_pellets.push(powerup_transform);
        this.invinc_pellets.push(powerup_transform2);
        this.invinc_pellets.push(powerup_transform3);
        this.invinc_pellets.push(powerup_transform4);
    }

    make_pellets(scale){
        // Pellet size is 1/2 of regular sphere
        const size = 0.2*scale;
        let pellet_transform = Mat4.scale(size,size,size);
        
        this.make_half_pellets(scale, pellet_transform, true);
        this.make_half_pellets(scale, pellet_transform, false);
    }

    make_half_pellets(scale, pellet_transform, left=true) {
        const x_dist = 0.5*scale;
        const x_width = 12.5*scale;

        let mirror = 1;
        if (left) mirror = -1;

        // The row of pellets starting at pacman's origin
        for (let i = x_dist+scale; i <= x_width-scale; i+=scale) {
            if (i == 7.5*scale || i == 8.5*scale || i == 9.5*scale) continue;
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*i,0,0).times(pellet_transform);
            this.pellets.push(model_transform);
        }

        // The long vertical from pacman's origin
        for (let i = -3*scale; i <= 21*scale; i+=scale) {
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*7.5*scale,0,-i).times(pellet_transform);
            this.pellets.push(model_transform);
        }

        // The long horizontal at the bottom
        for (let i = 0.5*scale; i <= x_width; i+=scale) {
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*i,0,6*scale).times(pellet_transform);
            this.pellets.push(model_transform);
        }

        // The long horizontal above ghosts top
        for (let i = x_dist; i <= x_width; i+=scale) {
            if (i == 7.5*scale) continue;
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*i,0,-18*scale).times(pellet_transform);
            this.pellets.push(model_transform);
        }

        // The topmost long horizontal
        for (let i = x_dist+scale; i <= x_width; i+=scale) {
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*i,0,-22*scale).times(pellet_transform);
            this.pellets.push(model_transform);
        }

        // The horizontal on the bottom of ghosts
        for (let i = x_dist+scale; i <= x_width; i+=scale) {
            if (i == 7.5*scale) continue;
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*i,0,-3*scale).times(pellet_transform);
            this.pellets.push(model_transform);
        }

        // The top close to center long horizontal with the vertical wall in between
        for (let i = x_dist+scale; i <= x_width; i+=scale) {
            if (i == 7.5*scale || i == 5.5*scale || i == 6.5*scale) continue;
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*i,0,-15*scale).times(pellet_transform);
            this.pellets.push(model_transform);          
        }

        // The bottom middle long horizontal with the vertical wall in between
        for (let i = x_dist+scale; i <= x_width; i+=scale) {
            if (i == 7.5*scale || i == 5.5*scale || i == 6.5*scale) continue;
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*i,0,3*scale).times(pellet_transform);
            this.pellets.push(model_transform);         
        }

        // Side verticals at top side
        for (let i = 0; i < 6*scale; i+=scale) {
            if (i == 2*scale || i == 4*scale) continue;
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*x_width,0,-i-16*scale).times(pellet_transform);
            this.pellets.push(model_transform);
        }

        // Side verticals at top middle
        for (let i = 0; i < 2*scale; i+=scale) {
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*4.5*scale,0,-i-16*scale).times(pellet_transform);
            this.pellets.push(model_transform);
        }

        // Topmost short center verticals
        for (let i = 0; i < 3*scale; i+=scale) {
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*1.5*scale,0,-i-19*scale).times(pellet_transform);
            this.pellets.push(model_transform);
        }

        // Two sets of short center verticals
        for (let i = 0; i < 8*scale; i+=scale) {
            if (i == 2*scale) i+=4*scale;
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*1.5*scale,0,i-2*scale).times(pellet_transform);
            this.pellets.push(model_transform);
        }

        // Short side verticals at bottom middle + side
        for (let i = 0; i < 2*scale; i+=scale) {
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*4.5*scale,0,i+scale).times(pellet_transform);
            this.pellets.push(model_transform);
            this.pellets.push(Mat4.translation(mirror*6*scale,0,0).times(model_transform));
        }

        // Bottom sidemost verticals
        for (let i = 0; i < 8*scale; i+=scale) {
            if (i == 2*scale) i+=4*scale;
            // Positive x-axis
            let model_transform = Mat4.translation(mirror*x_width,0,i-2*scale).times(pellet_transform);
            this.pellets.push(model_transform);      
        }
    }

    draw_walls(context, program_state, maze_scale, map=false){
        let m;
        for (let i = 0; i < this.walls.length; i++){
            const wall = this.walls[i];
            if (wall.vert)
                m = Mat4.scale(wall.width, 1, wall.length);
            else
                m = Mat4.scale(wall.length, 1, wall.width);
            if (map) {
                this.shapes.cube.draw(context, program_state, Mat4.scale(maze_scale,1,maze_scale).times(wall.center).times(m), this.materials.wall_mm);
            } else {
                this.shapes.cube.draw(context, program_state, Mat4.scale(maze_scale,1,maze_scale).times(wall.center).times(m), this.materials.wall);
            }
        }
    }

    make_wall(loc, length, maze_scale=1, vert=false, width=1){
        width = width / 2;
        length = length / 2;
        this.walls.push(Wall(loc, length, width, vert));
    }

    make_side(maze_scale=1, left=false){
        let mirror = 1;
        if (left)
            mirror = -1;
        //top sideways T
        let model_trans_wall_1 = Mat4.translation(mirror*6,0,-13.5);
        let model_trans_wall_2 = Mat4.translation(mirror*4,0,-13.5);
        //vert side
        let model_trans_wall_3 = Mat4.translation(mirror*6,0,-6);
        //horiz side
        let model_trans_wall_4 = Mat4.translation(mirror*4.5,0,-1.5);
        //upside down L
        let model_trans_wall_5 = Mat4.translation(mirror*10,0,-1.5);
        let model_trans_wall_6 = Mat4.translation(mirror*9,0,0.5);
        //upside down T
        let model_trans_wall_7 = Mat4.translation(mirror*7,0,4.5);
        let model_trans_wall_8 = Mat4.translation(mirror*6,0,2.5);
        //horiz top side
        let model_trans_wall_9 = Mat4.translation(mirror*10,0,-16.5);
        //top box
        let model_trans_wall_10 = Mat4.translation(mirror*4.5,0,-20);
        //top side box
        let model_trans_wall_11 = Mat4.translation(mirror*10,0,-20);

        //outer walls
        //top jutout
        let model_trans_wall_12 = Mat4.translation(mirror*11.25,0,-10.25);
        let model_trans_wall_13 = Mat4.translation(mirror*11,0,-13.75);
        let model_trans_wall_14 = Mat4.translation(mirror*8.75,0,-12);
        //bottom jutout
        let model_trans_wall_15 = Mat4.translation(mirror*11,0,-4.25);
        let model_trans_wall_16 = Mat4.translation(mirror*11.25,0,-7.75);
        let model_trans_wall_17 = Mat4.translation(mirror*8.75,0,-6);
        //horiz out of side wall
        let model_trans_wall_18 = Mat4.translation(mirror*12.5,0,1.5);
        //top side wall
        let model_trans_wall_19 = Mat4.translation(mirror*13.75,0,-18.5);
        //bottom side wall
        let model_trans_wall_20 = Mat4.translation(mirror*13.75,0,1.5);


        this.make_wall(model_trans_wall_1, 7, maze_scale, true);
        this.make_wall(model_trans_wall_2, 3, maze_scale);
        this.make_wall(model_trans_wall_3, 4, maze_scale, true);
        this.make_wall(model_trans_wall_4, 4, maze_scale);
        this.make_wall(model_trans_wall_5, 3, maze_scale);
        this.make_wall(model_trans_wall_6, 3, maze_scale, true);
        this.make_wall(model_trans_wall_7, 9, maze_scale);
        this.make_wall(model_trans_wall_8, 3, maze_scale, true);
        this.make_wall(model_trans_wall_9, 3, maze_scale);

        this.make_wall(model_trans_wall_10, 4, maze_scale, false, 2);
        this.make_wall(model_trans_wall_11, 3, maze_scale, false, 2);

        this.make_wall(model_trans_wall_12, 5.5, maze_scale, false, 0.5);
        this.make_wall(model_trans_wall_13, 5, maze_scale, false, 0.5);
        this.make_wall(model_trans_wall_14, 4, maze_scale, true, 0.5);
        this.make_wall(model_trans_wall_15, 5, maze_scale, false, 0.5);
        this.make_wall(model_trans_wall_16, 5.5, maze_scale, false, 0.5);
        this.make_wall(model_trans_wall_17, 4, maze_scale, true, 0.5);
        this.make_wall(model_trans_wall_18, 2, maze_scale);
        this.make_wall(model_trans_wall_19, 10, maze_scale, true, 0.5);
        this.make_wall(model_trans_wall_20, 12, maze_scale, true, 0.5);
       
    }

    make_walls(maze_scale){
        //center structs
        //T in front of pacman
        let model_trans_wall_1 = Mat4.translation(0,0,-4.5);
        let model_trans_wall_2 = Mat4.translation(0,0,-2.5);
        //T behind pacman
        let model_trans_wall_3 = Mat4.translation(0,0,1.5);
        let model_trans_wall_4 = Mat4.translation(0,0,3.5);
        //top most T
        let model_trans_wall_5 = Mat4.translation(0,0,-16.5);
        let model_trans_wall_6 = Mat4.translation(0,0,-14.5);
        //ghost box
        let model_trans_wall_7 = Mat4.translation(0,0,-7.25);
        let model_trans_wall_8 = Mat4.translation(3.25,0,-9);
        let model_trans_wall_9 = Mat4.translation(-3.25,0,-9);
        //let model_trans_wall_10 = Mat4.translation(0,0,-10.75); //change later to make gate
        
        //outer walls
        //vert out of top wall
        let model_trans_wall_11 = Mat4.translation(0,0,-21);
        //top
        let model_trans_wall_12 = Mat4.translation(0,0,-23.25);
        //bottom
        let model_trans_wall_13 = Mat4.translation(0,0,7.25);

        this.make_wall(model_trans_wall_1, 7, maze_scale);
        this.make_wall(model_trans_wall_2, 3, maze_scale, true);
        this.make_wall(model_trans_wall_3, 7, maze_scale);
        this.make_wall(model_trans_wall_4, 3, maze_scale, true);
        this.make_wall(model_trans_wall_5, 7, maze_scale);
        this.make_wall(model_trans_wall_6, 3, maze_scale, true);

        this.make_wall(model_trans_wall_7, 7, maze_scale, false, 0.5);
        this.make_wall(model_trans_wall_8, 4, maze_scale, true, 0.5);
        this.make_wall(model_trans_wall_9, 4, maze_scale, true, 0.5);
        //this.make_wall(model_trans_wall_10, 7, maze_scale, false, 0.5);

        this.make_wall(model_trans_wall_11, 4, maze_scale, true);
        this.make_wall(model_trans_wall_12, 27, maze_scale, false, 0.5);
        this.make_wall(model_trans_wall_13, 27, maze_scale, false, 0.5);

        this.make_side(maze_scale);
        this.make_side(maze_scale, true);
    }

    speed_powerup_pos_checker() {
        if (this.speed_pos_random_number == 1) {
            activeSpeedPowerup = 1;
            this.speed_powerup_pos1 = true;
        } else if (this.speed_pos_random_number == 2) {
            activeSpeedPowerup = 2;
            this.speed_powerup_pos2 = true;
        } else if (this.speed_pos_random_number == 3) {
            activeSpeedPowerup = 3;
            this.speed_powerup_pos3 = true;
        } else if (this.speed_pos_random_number == 4) {
            activeSpeedPowerup = 4;
            this.speed_powerup_pos4 = true;
        }
        this.speed_powerup = true;
    }
     
    make_speed_powerup(context, program_state, scale) {
        let model_transform = Mat4.identity();
        if (this.speed_powerup_pos1 === true) {
            this.scale_factor -= .008;
            let speed_transform1 = model_transform.times(Mat4.translation(-1.5*scale,0,4.5*scale)).times(Mat4.scale(this.scale_factor, this.scale_factor, this.scale_factor));
            
            if (speedCollide === false) {
            if (this.scale_factor > .4) 
                this.shapes.cube.draw(context,program_state, speed_transform1, this.materials.speed_powerup);
            else
                this.shapes.cube.draw(context,program_state, speed_transform1, this.materials.speed_powerup.override({color: hex_color("FF0000")}));
            }
            
            if (this.scale_factor < 0 || (speedCollide === true && activeSpeedPowerup === 1)) {
                this.speed_powerup_pos1 = false;
                this.speed_powerup = false;
                this.scale_factor = 1;
                this.speed_pos_random_number = Math.floor(Math.random() * (Math.floor(4) - Math.ceil(1) + 1) + Math.ceil(1));
                speedCollide = false;
            }

        } else if (this.speed_powerup_pos2 === true) {
            this.scale_factor -= .008;
            let speed_transform2 = model_transform.times(Mat4.translation(1.5*scale,0,4.5*scale)).times(Mat4.scale(this.scale_factor, this.scale_factor, this.scale_factor));;
            
            if (speedCollide === false) {
            if (this.scale_factor > .4) 
                this.shapes.cube.draw(context,program_state, speed_transform2, this.materials.speed_powerup);
            else
                this.shapes.cube.draw(context,program_state, speed_transform2, this.materials.speed_powerup.override({color: hex_color("FF0000")}));
            }

            if (this.scale_factor < 0 || (speedCollide === true && activeSpeedPowerup === 2)) {
                this.speed_powerup_pos2 = false;
                this.speed_powerup = false;
                this.scale_factor = 1;
                this.speed_pos_random_number = Math.floor(Math.random() * (Math.floor(4) - Math.ceil(1) + 1) + Math.ceil(1));
                speedCollide = false;
            }
            
        } else if (this.speed_powerup_pos3 === true) {
            this.scale_factor -= .008;
            let speed_transform3 = model_transform.times(Mat4.translation(1.5*scale,0,-20*scale)).times(Mat4.scale(this.scale_factor, this.scale_factor, this.scale_factor));;
            
            if (speedCollide === false) {
            if (this.scale_factor > .4) 
                this.shapes.cube.draw(context,program_state, speed_transform3, this.materials.speed_powerup);
            else
                this.shapes.cube.draw(context,program_state, speed_transform3, this.materials.speed_powerup.override({color: hex_color("FF0000")}));
            }

            if (this.scale_factor < 0 || (speedCollide === true && activeSpeedPowerup === 3)) {
                this.speed_powerup_pos3 = false;
                this.speed_powerup = false;
                this.scale_factor = 1;
                this.speed_pos_random_number = Math.floor(Math.random() * (Math.floor(4) - Math.ceil(1) + 1) + Math.ceil(1));
                speedCollide = false;
            }
            
        } else if (this.speed_powerup_pos4 === true) {
            this.scale_factor -= .008;
            let speed_transform4 = model_transform.times(Mat4.translation(-1.5*scale,0,-20*scale)).times(Mat4.scale(this.scale_factor, this.scale_factor, this.scale_factor));;
            
            if (speedCollide === false) {
            if (this.scale_factor > .4) 
                this.shapes.cube.draw(context,program_state, speed_transform4, this.materials.speed_powerup);
            else
                this.shapes.cube.draw(context,program_state, speed_transform4, this.materials.speed_powerup.override({color: hex_color("FF0000")}));
            }

            if (this.scale_factor < 0 || (speedCollide === true && activeSpeedPowerup === 4)) {
                this.speed_powerup_pos4 = false;
                this.speed_powerup = false;
                this.scale_factor = 1;
                this.speed_pos_random_number = Math.floor(Math.random() * (Math.floor(4) - Math.ceil(1) + 1) + Math.ceil(1));
                speedCollide = false;
            }
        }
    }

    texture_buffer_init(gl) {
        // Depth Texture
        this.lightDepthTexture = gl.createTexture();
        // Bind it to TinyGraphics
        this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);

        this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
        gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.RGBA, // internal format
            this.lightDepthTextureSize,   // width
            this.lightDepthTextureSize,   // height
            0,                  // border
            gl.RGBA, // format
            gl.UNSIGNED_BYTE,    // type
            null);              // data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Depth Texture Buffer
        this.lightDepthFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.COLOR_ATTACHMENT0,  // attachment point
            gl.TEXTURE_2D,        // texture target
            this.lightDepthTexture,         // texture
            0);                   // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // create a color texture of the same size as the depth texture
        // see article why this is needed_
        this.unusedTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.lightDepthTextureSize,
            this.lightDepthTextureSize,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // attach it to the framebuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point
            gl.TEXTURE_2D,         // texture target
            this.unusedTexture,         // texture
            0);                    // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        varying vec4 VERTEX_COLOR;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                   
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform; 
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                VERTEX_COLOR = vec4( shape_color.xyz * ambient, shape_color.w );
                VERTEX_COLOR.xyz = phong_model_lights( normalize( N ), vertex_worldspace );
                
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                
                gl_FragColor = VERTEX_COLOR;
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}