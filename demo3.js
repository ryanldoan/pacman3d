import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;
const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader, Basic_Shader, Subdivision_Sphere} = defs

export class Demo3 extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            cube: new Cube(),
            pacman: new defs.Subdivision_Sphere(4),
        };

        // *** Materials
        this.materials = {
            wall: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#4444CC")}),
            pacman: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#FFFF00")}),
        }

        this.follow = true;
        this.abs_dir = 'f';
        this.scale = 2;
        this.speed = 3;
        this.model_transform = Mat4.identity();
        this.pov1 = Mat4.inverse((this.model_transform).times(Mat4.translation(0,3,5)).times(Mat4.rotation(-Math.PI/12,1,0,0)));
        this.pov3 = Mat4.look_at(vec3(0, 50*this.scale, 10*this.scale), vec3(0, 0, -5*this.scale), vec3(0, 0, -1));;
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Forward", ["u"], () => {
            this.dir = 'f';
        });
        this.new_line();
        this.key_triggered_button("Right", ["k"], () => {
            this.dir = 'r';
        });
        //this.new_line();
        this.key_triggered_button("Left", ["h"], () => {
            this.dir = 'l';
        });
        this.new_line();
        this.key_triggered_button("Backward", ["j"], () => {
            this.dir = 'b';
        });
        this.new_line();
        this.key_triggered_button("Stop", ["m"], () => {
            this.dir = 's';
        });
        this.new_line(); this.new_line();
        this.key_triggered_button("Camera POV", ["c"], () => {
            if (this.follow){
                this.model_transform = (this.model_transform).times(Mat4.inverse(Mat4.rotation(this.getAngle(this.abs_dir),0,1,0)));
                if (this.dir !== 's' && this.dir != null)
                    this.dir = this.abs_dir;
            }else{
                this.model_transform = (this.model_transform).times(Mat4.rotation(this.getAngle(this.abs_dir),0,1,0));
                if (this.dir !== 's' && this.dir != null)
                    this.dir = 'f';
            }
            
            this.follow ^= 1;
        });
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        this.speed = 5;
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            
            // Define the global camera and projection matrices, which are stored in program_state.
            let initial_camera_location;
            if (this.follow) initial_camera_location = this.pov1;
            else initial_camera_location = this.pov3;

            program_state.set_camera(initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        const light_position = vec4(0, 50*this.scale, -15*this.scale, 1);

        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 5000*this.scale**2)];

        this.make_walls(context, program_state, this.scale);

        let T;
        const move = -0.1-(this.speed-1)*0.02;
        
        if (this.follow){
            if (this.dir != null)
                this.model_transform = (this.model_transform).times(Mat4.inverse(Mat4.rotation(this.getAngle(this.abs_dir),0,1,0)));
            T = this.model_transform;
            this.abs_dir = this.getNewDir();
            if (this.dir != null){
                if (this.dir !== 's') this.dir = 'f';

                this.model_transform = (this.model_transform).times(Mat4.rotation(this.getAngle(this.abs_dir),0,1,0)).times(Mat4.inverse(T));
                if (this.dir === 'f')
                    this.model_transform = (this.model_transform).times(Mat4.translation(0,0,move));
            }
        }else{
            if (this.dir !== 's' && this.dir != null)
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
        this.model_transform = (this.model_transform).times(T);
            

        this.shapes.pacman.draw(context, program_state, this.model_transform, this.materials.pacman);

        let desired;
        if (this.follow)
            desired = Mat4.inverse((this.model_transform).times(Mat4.translation(0,3,5)).times(Mat4.rotation(-Math.PI/12,1,0,0)));
        else
            desired = this.pov3;//Mat4.inverse((this.model_transform).times(Mat4.translation(0,50,10)).times(Mat4.rotation(-Math.PI/2,1,0,0)));
            
        desired = desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
        program_state.set_camera(desired);
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
                if (this.dir != null && this.dir !== 's')
                    return this.dir;
                break;
            default:
                break;
        };
        return this.abs_dir;
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
        let model_trans_wall_12 = Mat4.translation(mirror*11,0,-10.25);
        let model_trans_wall_13 = Mat4.translation(mirror*11,0,-13.75);
        let model_trans_wall_14 = Mat4.translation(mirror*8.75,0,-12);
        //bottom jutout
        let model_trans_wall_15 = Mat4.translation(mirror*11,0,-4.25);
        let model_trans_wall_16 = Mat4.translation(mirror*11,0,-7.75);
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

        this.make_wall(context, program_state, model_trans_wall_12, 5, maze_scale, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_13, 5, maze_scale, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_14, 4, maze_scale, true, 0.5);
        this.make_wall(context, program_state, model_trans_wall_15, 5, maze_scale, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_16, 5, maze_scale, false, 0.5);
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