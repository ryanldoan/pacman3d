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
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#888888")}),
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
            this.FORWARD = true;
            this.BACKWARD = false;
            this.RIGHT = false;
            this.LEFT = false;
        });
        this.new_line();
        this.key_triggered_button("Backward", ["j"], () => {
            this.FORWARD = false;
            this.BACKWARD = true;
            this.RIGHT = false;
            this.LEFT = false;
        });
        this.new_line();
        this.key_triggered_button("Right", ["k"], () => {
            this.FORWARD = false;
            this.BACKWARD = false;
            this.RIGHT = true;
            this.LEFT = false;
        });
        this.new_line();
        this.key_triggered_button("Left", ["h"], () => {
            this.FORWARD = false;
            this.BACKWARD = false;
            this.RIGHT = false;
            this.LEFT = true;
        });
    }

    make_walls(context, program_state, left=true){
        let mirror = 1;
        if (left)
            mirror = -1;

        let model_trans_wall_1 = Mat4.translation(-5, 2 - 0.1, 0).times(Mat4.scale(0.33, 1, 10)); 
        let model_trans_wall_2 = Mat4.translation(+5, 2 - 0.1, 0).times(Mat4.scale(0.33, 1, 10));
        let model_trans_wall_3 = Mat4.translation(0, 2 - 0.1, -15).times(Mat4.scale(6.25, 1, 0.33));
        let model_trans_wall_4 = Mat4.translation(+9, 2 - 0.1, 0).times(Mat4.scale(4.25, 1, 0.33)); 
        let model_trans_wall_5 = Mat4.translation(+15, 2 - 0.1, -10).times(Mat4.scale(0.33, 1, 6.25));
        let model_trans_wall_6 = Mat4.translation(-11, 2 - 0.1, -10).times(Mat4.scale(6.25, 1, 0.33));
        let model_trans_wall_7 = Mat4.translation(0, 2 - 0.1, -20).times(Mat4.scale(6.25, 1, 0.33));
        let model_trans_wall_8 = Mat4.translation(+6, 2 - 0.1, -26).times(Mat4.scale(0.33, 1, 6.25));
        let model_trans_wall_9 = Mat4.translation(-6, 2 - 0.1, -26).times(Mat4.scale(0.33, 1, 6.25));
        let model_trans_wall_10 = Mat4.translation(-17, 2 - 0.1, 0).times(Mat4.scale(0.33, 1, 10));
        let model_trans_wall_11 = Mat4.translation(-11, 2 - 0.1, +10).times(Mat4.scale(6.25, 1, 0.33));
        let model_trans_wall_12 = Mat4.translation(+15, 2 - 0.1, +10).times(Mat4.scale(0.33, 1, 6.25)); // far right
        let model_trans_wall_13 = Mat4.translation(-24, 2 - 0.1, -20).times(Mat4.scale(6.25, 1, 0.33));
        let model_trans_wall_14 = Mat4.translation(-18, 2 - 0.1, -26).times(Mat4.scale(0.33, 1, 6.25));
        let model_trans_wall_15 = Mat4.translation(-30, 2 - 0.1, -26).times(Mat4.scale(0.33, 1, 6.25));
        let model_trans_wall_16 = Mat4.translation(-30, 2 - 0.1, -15).times(Mat4.scale(10, 1, 0.33));
        let model_trans_wall_17 = Mat4.translation(-30, 2 - 0.1, -11).times(Mat4.scale(0.33, 1, 4.25));
        let model_trans_wall_18 = Mat4.translation(18, 2 - 0.1, -32).times(Mat4.scale(12, 1, 0.33));
        let model_trans_wall_19 = Mat4.translation(-42, 2 - 0.1, -32).times(Mat4.scale(12, 1, 0.33));

        this.shapes.cube.draw(context, program_state, model_trans_wall_1, this.materials.wall);
        this.shapes.cube.draw(context, program_state, model_trans_wall_2, this.materials.wall);
        this.shapes.cube.draw(context, program_state, model_trans_wall_3, this.materials.wall);
        this.shapes.cube.draw(context, program_state, model_trans_wall_4, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_5, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_6, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_7, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_8, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_9, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_10, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_11, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_12, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_13, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_14, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_15, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_16, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_17, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_18, this.materials.wall); 
        this.shapes.cube.draw(context, program_state, model_trans_wall_19, this.materials.wall); 
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
        
        let model_transform = Mat4.identity().times(Mat4.scale(1,1,1)).times(Mat4.translation(this.posX, 0, this.posZ));

        if (this.FORWARD) {
            this.posZ -= 0.1;
        }
        else if (this.BACKWARD) {
            this.posZ += 0.1;
        }
        else if (this.RIGHT) {
            this.posX += 0.1;
        }
        else if (this.LEFT) {
            this.posX -= 0.1;
        }

        this.shapes.pacman.draw(context, program_state, model_transform, this.materials.pacman);
        if (this.FORWARD != null && this.BACKWARD != null && this.RIGHT != null && this.LEFT != null){
            let desired = Mat4.inverse(model_transform.times(Mat4.translation(0,0,5)));
            program_state.set_camera(desired);
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