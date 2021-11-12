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

        this.initial_camera_location = Mat4.look_at(vec3(0, 5, 5), vec3(0, 0, 0), vec3(0, 1, 0));
        this.posX = 0;
        this.posZ = 0;
        this.speed = 0;
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Forward", ["u"], () => {
            this.dir = 'f';
        });
        this.new_line();
        this.key_triggered_button("Backward", ["j"], () => {
            this.dir = 'b';
        });
        this.new_line();
        this.key_triggered_button("Right", ["k"], () => {
            this.dir = 'r';
        });
        this.new_line();
        this.key_triggered_button("Left", ["h"], () => {
            this.dir = 'l';
        });
        this.new_line();
        this.key_triggered_button("Stop", ["m"], () => {
            this.dir = 's';
        });
    }

    make_wall(context, program_state, loc, length, vert=false, width=1){
        width = width / 2;
        length = length / 2;

        let m;
        if (vert == true){
            m = Mat4.scale(width, 1, length);
        }else{
            m = Mat4.scale(length, 1, width);
        }
        this.shapes.cube.draw(context, program_state, loc.times(m), this.materials.wall);
    }

    make_side(context, program_state, left=false){
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


        this.make_wall(context, program_state, model_trans_wall_1, 7, true);
        this.make_wall(context, program_state, model_trans_wall_2, 3);
        this.make_wall(context, program_state, model_trans_wall_3, 4, true);
        this.make_wall(context, program_state, model_trans_wall_4, 4);
        this.make_wall(context, program_state, model_trans_wall_5, 3);
        this.make_wall(context, program_state, model_trans_wall_6, 3, true);
        this.make_wall(context, program_state, model_trans_wall_7, 9);
        this.make_wall(context, program_state, model_trans_wall_8, 3, true);
        this.make_wall(context, program_state, model_trans_wall_9, 3);

        this.make_wall(context, program_state, model_trans_wall_10, 4, false, 2);
        this.make_wall(context, program_state, model_trans_wall_11, 3, false, 2);

        this.make_wall(context, program_state, model_trans_wall_12, 5, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_13, 5, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_14, 4, true, 0.5);
        this.make_wall(context, program_state, model_trans_wall_15, 5, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_16, 5, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_17, 4, true, 0.5);
        this.make_wall(context, program_state, model_trans_wall_18, 2);
        this.make_wall(context, program_state, model_trans_wall_19, 10, true, 0.5);
        this.make_wall(context, program_state, model_trans_wall_20, 12, true, 0.5);
       
    }

    make_walls(context, program_state, left=true){
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

        this.make_wall(context, program_state, model_trans_wall_1, 7);
        this.make_wall(context, program_state, model_trans_wall_2, 3, true);
        this.make_wall(context, program_state, model_trans_wall_3, 7);
        this.make_wall(context, program_state, model_trans_wall_4, 3, true);
        this.make_wall(context, program_state, model_trans_wall_5, 7);
        this.make_wall(context, program_state, model_trans_wall_6, 3, true);

        this.make_wall(context, program_state, model_trans_wall_7, 7, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_8, 4, true, 0.5);
        this.make_wall(context, program_state, model_trans_wall_9, 4, true, 0.5);
        this.make_wall(context, program_state, model_trans_wall_10, 7, false, 0.5);

        this.make_wall(context, program_state, model_trans_wall_11, 4, true);
        this.make_wall(context, program_state, model_trans_wall_12, 27, false, 0.5);
        this.make_wall(context, program_state, model_trans_wall_13, 27, false, 0.5);

        this.make_side(context, program_state);
        this.make_side(context, program_state, true);
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        const light_position = vec4(0, 10, 10, 1);

        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        this.make_walls(context, program_state);
        
        let model_transform = Mat4.identity().times(Mat4.translation(this.posX, 0, this.posZ));

        switch(this.dir){
            case 'f':
                this.posZ -= 0.1;
                break;
            case 'l':
                this.posX -= 0.1;
                break;
            case 'r':
                this.posX += 0.1;
                break;
            case 'b':
                this.posZ += 0.1;
                break;
            default:
                break;
        };

        this.shapes.pacman.draw(context, program_state, model_transform, this.materials.pacman);
        if (this.dir != null){
            let desired = Mat4.inverse(model_transform.times(Mat4.translation(0,0,5)));
            //program_state.set_camera(desired);
        }
    }
}

class Shader_Version_1 extends Shader {
    constructor() {
        super();
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;       
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 ); // <---
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        return this.shared_glsl_code() + `
            uniform vec4 shape_color; // <---
        
            void main(){                                                           
                gl_FragColor = shape_color;
            } `;
    }

    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Set uniform parameters
        context.uniform4fv(gpu_addresses.shape_color, material.color);
    }
}

class Shader_Version_2 extends Shader {
    constructor() {
        super();
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        
        varying vec4 position_WCS; // <---
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;       
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 ); 
                position_WCS = model_transform * vec4( position, 1.0 ); 
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        return this.shared_glsl_code() + `
            uniform vec4 shape_color; 
            uniform vec4 second_color; // <---
        
            void main(){              
                float factor = 0.5 + 0.5 * sin(position_WCS.x * 5.0);
                vec4 mixed_color = factor * second_color + (1.0 - factor) * shape_color;
                gl_FragColor = mixed_color;
            } `;
    }

    // CHANGED
    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform4fv(gpu.second_color, material.second_color); // <---
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Set uniform parameters
        context.uniform4fv(gpu_addresses.shape_color, material.color);
        context.uniform4fv(gpu_addresses.second_color, material.second_color); // <---
    }
}

class Shader_Version_3 extends Shader {
    constructor() {
        super();
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        
        varying vec4 position_OCS; // <---
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;       
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 ); 
                position_OCS = vec4( position, 1.0 ); // <---
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        return this.shared_glsl_code() + `
            uniform vec4 shape_color; 
        
            void main(){              
                float factor = 0.5 + 0.5 * sin(position_OCS.x * 10.0 + position_OCS.y * 10.0);
                vec4 mixed_color =  vec4(shape_color.xyz, factor);
                gl_FragColor = mixed_color;
            } `;
    }

    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Set uniform parameters
        context.uniform4fv(gpu_addresses.shape_color, material.color);
    }
}