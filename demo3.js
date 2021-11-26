import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;
const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader, Basic_Shader, Subdivision_Sphere} = defs

import {Shape_From_File} from './examples/obj-file-demo.js'


class Maze_Runner {
    constructor(model_info, loc_transform, rm=Mat4.identity(), maze_scale, speed=1, abs_dir='f', dir='s'){
        this.model_info = model_info;
        this.dir = dir;
        this.abs_dir = abs_dir;
        this.speed = speed;
        this.upright_R = rm;
        this.maze_scale = maze_scale;
        this.model_transform = Mat4.rotation(this.getAngle(this.abs_dir),0,1,0).times(loc_transform);
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
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#FFFF00")}),
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
        super(model_info, loc_transform, Mat4.rotation(Math.PI,0,1,0).times(Mat4.rotation(-Math.PI/6,1,0,0)), maze_scale, speed, 's');
        this.turn_dt = 2;
    }

    move(follow, dt){
        let turn_t = 2+Math.random()*4;
        if (this.turn_dt > turn_t){
            this.turn_dt = 0
            let dir = Math.floor(Math.random()*4);
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
        };

        // *** Materials
        this.materials = {
            wall: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.6, specularity: 0.7, color: hex_color("#4444CC")}),
            pellet: new Material(new defs.Phong_Shader(),
                {ambient: 1, color: hex_color("#fff2c7")}),
        }

        this.follow = true;
        this.scale = 2;
        const speed = this.scale;

        this.pacman = new PacMan(this.scale, speed);
        this.ghost1 = new Ghost(Mat4.translation(0,0,-9.25*this.scale), this.scale, speed);
        this.ghost2 = new Ghost(Mat4.translation(-2*this.scale,0,-9.25*this.scale), this.scale, speed);
        this.ghost3 = new Ghost(Mat4.translation(2*this.scale,0,-9.25*this.scale), this.scale, speed);
        this.alive = [this.pacman, this.ghost1, this.ghost2, this.ghost3];

        this.pov1_matrix = Mat4.translation(0,3,4).times(Mat4.rotation(-Math.PI/12,1,0,0));
        this.pov3 = Mat4.look_at(vec3(0, 50*this.scale, 10*this.scale), vec3(0, 0, -5*this.scale), vec3(0, 0, -1));
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Forward", ["u"], () => {
            this.pacman.dir = 'f';
        });
        this.new_line();
        this.key_triggered_button("Right", ["k"], () => {
            this.pacman.dir = 'r';
        });
        //this.new_line();
        this.key_triggered_button("Left", ["h"], () => {
            this.pacman.dir = 'l';
        });
        this.new_line();
        this.key_triggered_button("Backward", ["j"], () => {
            this.pacman.dir = 'b';
        });
        this.new_line();
        this.key_triggered_button("Stop", ["m"], () => {
            this.pacman.dir = 's';
        });
        this.new_line(); this.new_line();
        this.key_triggered_button("Camera POV", ["c"], () => {
            for (let i = 0; i < this.alive.length; ++i) {
                const runner = this.alive[i];
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

    display(context, program_state) {
        // display():  Called once per frame of animation.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            
            // Define the global camera and projection matrices, which are stored in program_state.
            let initial_camera_location;
            if (this.follow)
                initial_camera_location = Mat4.inverse((this.pacman.model_transform).times(this.pov1_matrix));
            else initial_camera_location = this.pov3;
            
            //initial_camera_location = Mat4.look_at(vec3(0, 3*this.scale, -13*this.scale), vec3(0, 0, -7*this.scale), vec3(0, 0, 1));//DELETE: to look at ghost faces

            program_state.set_camera(initial_camera_location);
        }
        
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        const light_positions = [vec4(0, 50*this.scale, -10*this.scale, 1), 
                                 vec4(0, 3, -6*this.scale, 1)];
        const white = color(1, 1, 1, 1);
        //const red = color(1, 0, 0, 1);
        const bright = 5000*this.scale**2;
        //const dim = 10*this.scale**2;

        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_positions[0], white, bright)];

        this.make_walls(context, program_state, this.scale);
        this.make_pellets(context, program_state);
        //const ghost_colors = ["FF8888","",""]
        let dir_R = Mat4.identity();
        for (let i = 0; i < this.alive.length; ++i) {
            const runner = this.alive[i];
            if (i > 0 && this.pacman.dir==='s'){
                runner.dir = 's';
                runner.move(this.follow, 0);
            }else
                runner.move(this.follow, dt);
            if (!this.follow || i > 0)
                dir_R = runner.getRotationMatrix();
            runner.model_info.shape.draw(context, program_state, runner.model_transform.times(dir_R).times(runner.upright_R), runner.model_info.material);
        }

        let desired;
        if (this.follow)
            desired = Mat4.inverse((this.pacman.model_transform).times(this.pov1_matrix));
        else
            desired = this.pov3;    //Mat4.inverse((this.pacman.model_transform).times(Mat4.translation(0,50,10)).times(Mat4.rotation(-Math.PI/2,1,0,0)));
            
        desired = desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.15));
        program_state.set_camera(desired);
    }
    
    make_pellets(context, program_state) {
        // Pellet size is 1/2 of regular sphere
        let pellet_transform = Mat4.identity().times(Mat4.scale(0.5,0.5,0.5));

        // The row of pellets starting at pacman's origin
        for (let i = 0; i <= 30; i++) {
            if (i % 5 === 0 && i !== 0) {

                // Positive x-axis
                let model_transform = pellet_transform.times(Mat4.translation(i,0,0));
                this.shapes.pellet.draw(context, program_state, model_transform, this.materials.pellet);
                
                // Negative x-axis (mirror in this case since equal length)
                let model_transform2 = pellet_transform.times(Mat4.translation(-i,0,0));
                this.shapes.pellet.draw(context, program_state, model_transform2, this.materials.pellet);
            }
        }

        // The long vertical from pacman's origin
        for (let i = 0; i <= 90; i++) {
            if (i % 5 === 0 && i !== 0) {

                // Positive x-axis
                let model_transform = pellet_transform.times(Mat4.translation(30,0,-i));
                this.shapes.pellet.draw(context, program_state, model_transform, this.materials.pellet);
                
                // Negative x-axis (mirror in this case since equal length)
                let model_transform2 = pellet_transform.times(Mat4.translation(-30,0,-i));
                this.shapes.pellet.draw(context, program_state, model_transform2, this.materials.pellet);
                
                // To fill in the small gap in the positive z-axis
                if (i <= 15) {
                    let model_transform3 = pellet_transform.times(Mat4.translation(-30,0,i));
                    this.shapes.pellet.draw(context, program_state, model_transform3, this.materials.pellet);

                    let model_transform4 = pellet_transform.times(Mat4.translation(30,0,i));
                    this.shapes.pellet.draw(context, program_state, model_transform4, this.materials.pellet);
                }
            }
        }

        // The long horizontal at the bottom
        for (let i = 0; i <= 50; i++) {
            if (i % 5 === 0) {

                // Positive x-axis
                let model_transform = pellet_transform.times(Mat4.translation(i,0,24));
                this.shapes.pellet.draw(context, program_state, model_transform, this.materials.pellet);
                
                // Negative x-axis (mirror in this case since equal length)
                let model_transform2 = pellet_transform.times(Mat4.translation(-i,0,24));
                this.shapes.pellet.draw(context, program_state, model_transform2, this.materials.pellet);
            }
        }

        // The long horizontal at the top
        for (let i = 0; i <= 50; i++) {
            if (i % 5 === 0 && i !== 30) {

                // Positive x-axis
                let model_transform = pellet_transform.times(Mat4.translation(i,0,-72));
                this.shapes.pellet.draw(context, program_state, model_transform, this.materials.pellet);
                
                // Negative x-axis (mirror in this case since equal length)
                let model_transform2 = pellet_transform.times(Mat4.translation(-i,0,-72));
                this.shapes.pellet.draw(context, program_state, model_transform2, this.materials.pellet);
            }
        }
>>>>>>> b33a447209ab7941b08fd85364aafb91b2766c32
    }

    make_wall(context, program_state, loc, length, maze_scale=1, vert=false, width=1){
        width = width / 2;
        length = length / 2;

        let m;
        if (vert == true){
            m = Mat4.scale(width, 1, length);
        }else{
            m = Mat4.scale(length, 1, width);
        }
        this.shapes.cube.draw(context, program_state, Mat4.scale(maze_scale,1,maze_scale).times(loc).times(m), this.materials.wall);
    }

    make_side(context, program_state, maze_scale=1, left=false){
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


        this.make_wall(context, program_state, model_trans_wall_1, 7, maze_scale, true);
        this.make_wall(context, program_state, model_trans_wall_2, 3, maze_scale);
        this.make_wall(context, program_state, model_trans_wall_3, 4, maze_scale, true);
        this.make_wall(context, program_state, model_trans_wall_4, 4, maze_scale);
        this.make_wall(context, program_state, model_trans_wall_5, 3, maze_scale);
        this.make_wall(context, program_state, model_trans_wall_6, 3, maze_scale, true);
        this.make_wall(context, program_state, model_trans_wall_7, 9, maze_scale);
        this.make_wall(context, program_state, model_trans_wall_8, 3, maze_scale, true);
        this.make_wall(context, program_state, model_trans_wall_9, 3, maze_scale);

        this.make_wall(context, program_state, model_trans_wall_10, 4, maze_scale, false, 2);
        this.make_wall(context, program_state, model_trans_wall_11, 3, maze_scale, false, 2);

        this.make_wall(context, program_state, model_trans_wall_12, 5.5, maze_scale, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_13, 5, maze_scale, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_14, 4, maze_scale, true, 0.5);
        this.make_wall(context, program_state, model_trans_wall_15, 5, maze_scale, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_16, 5.5, maze_scale, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_17, 4, maze_scale, true, 0.5);
        this.make_wall(context, program_state, model_trans_wall_18, 2, maze_scale);
        this.make_wall(context, program_state, model_trans_wall_19, 10, maze_scale, true, 0.5);
        this.make_wall(context, program_state, model_trans_wall_20, 12, maze_scale, true, 0.5);
       
    }

    make_walls(context, program_state, maze_scale){
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
        let model_trans_wall_10 = Mat4.translation(0,0,-10.75); //change later to make gate
        
        //outer walls
        //vert out of top wall
        let model_trans_wall_11 = Mat4.translation(0,0,-21);
        //top
        let model_trans_wall_12 = Mat4.translation(0,0,-23.25);
        //bottom
        let model_trans_wall_13 = Mat4.translation(0,0,7.25);

        this.make_wall(context, program_state, model_trans_wall_1, 7, maze_scale);
        this.make_wall(context, program_state, model_trans_wall_2, 3, maze_scale, true);
        this.make_wall(context, program_state, model_trans_wall_3, 7, maze_scale);
        this.make_wall(context, program_state, model_trans_wall_4, 3, maze_scale, true);
        this.make_wall(context, program_state, model_trans_wall_5, 7, maze_scale);
        this.make_wall(context, program_state, model_trans_wall_6, 3, maze_scale, true);

        this.make_wall(context, program_state, model_trans_wall_7, 7, maze_scale, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_8, 4, maze_scale, true, 0.5);
        this.make_wall(context, program_state, model_trans_wall_9, 4, maze_scale, true, 0.5);
        this.make_wall(context, program_state, model_trans_wall_10, 7, maze_scale, false, 0.5);

        this.make_wall(context, program_state, model_trans_wall_11, 4, maze_scale, true);
        this.make_wall(context, program_state, model_trans_wall_12, 27, maze_scale, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_13, 27, maze_scale, false, 0.5);

        this.make_side(context, program_state, maze_scale);
        this.make_side(context, program_state, maze_scale, true);
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