import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Demo3 extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            sphere: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(1, 15),
            // TODO:  Fill in as many additional shape instances as needed in this key/value table.
            //        (Requirement 1)
            s1: new defs.Subdivision_Sphere(1),
            s2: new defs.Subdivision_Sphere(2),
            s3: new defs.Subdivision_Sphere(3),
            s4: new defs.Subdivision_Sphere(4),
            f1: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(1),
            f2: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
            f3: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(3),
            f4: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(4),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            ver1: new Material(new Shader_Version_1(), { color: hex_color("#00ffff") }),
            ver2: new Material(new Shader_Version_2(), { color: hex_color("#00ffff"), second_color: hex_color("#ff0000") }),
            ver3: new Material(new Shader_Version_3(), { color: hex_color("#00ffff") }),
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 5, 5), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("View solar system", ["Control", "0"], () => this.attached = () => null);
        this.new_line();
        this.key_triggered_button("Attach to planet 1", ["Control", "1"], () => this.attached = () => this.planet_1);
        this.key_triggered_button("Attach to planet 2", ["Control", "2"], () => this.attached = () => this.planet_2);
        this.new_line();
        this.key_triggered_button("Attach to planet 3", ["Control", "3"], () => this.attached = () => this.planet_3);
        this.key_triggered_button("Attach to planet 4", ["Control", "4"], () => this.attached = () => this.planet_4);
        this.new_line();
        this.key_triggered_button("Attach to moon", ["Control", "m"], () => this.attached = () => this.moon);
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        let desired;
// Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        const light_position = vec4(0, 5, 5, 1);

        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
        // // Use following for Point Light Source with Changing Size
        // program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10 ** (t % 3))];

        // // Shader Example 1
        // this.shapes.torus.draw(context, program_state, Mat4.scale(1, 1, 0.2), this.materials.ver1);

        // Shader Example 2
        this.shapes.torus.draw(context, program_state, Mat4.scale(1, 1, 0.2), this.materials.ver2);

        // // Shader Example 3
        // let model_transformation = Mat4.translation(3 * Math.sin(t), 0, 0).times(
        //     Mat4.scale(1, 1, 0.2)
        // );
        // this.shapes.torus.draw(context, program_state, model_transformation, this.materials.ver2);

        // Shader Example 4
        let model_transformation = Mat4.translation(3 * Math.sin(t), 0, 0.5).times(
            Mat4.scale(1, 1, 0.2)
        );
        this.shapes.torus.draw(context, program_state, model_transformation, this.materials.ver3);

        // // Subdivisions
        // this.shapes.s1.draw(context, program_state, Mat4.translation(-3, 0, 0), this.materials.test);
        // this.shapes.s2.draw(context, program_state, Mat4.translation(-1, 0, 0), this.materials.test);
        // this.shapes.s3.draw(context, program_state, Mat4.translation(+1, 0, 0), this.materials.test);
        // this.shapes.s4.draw(context, program_state, Mat4.translation(+3, 0, 0), this.materials.test);
        // // Flat Shapes
        // this.shapes.f1.draw(context, program_state, Mat4.translation(-3, 0, 0), this.materials.test);
        // this.shapes.f2.draw(context, program_state, Mat4.translation(-1, 0, 0), this.materials.test);
        // this.shapes.f3.draw(context, program_state, Mat4.translation(+1, 0, 0), this.materials.test);
        // this.shapes.f4.draw(context, program_state, Mat4.translation(+3, 0, 0), this.materials.test);

        // // Example for Requirement about the camera.
        // this.planet_1 = Mat4.translation(-3, 0, 0);
        // this.planet_2 = Mat4.translation(-1, 0, 0);
        // this.planet_3 = Mat4.translation(+1, 0, 0);
        // this.planet_4 = Mat4.translation(+3, 0, 0);
        //
        // if (this.attached && this.attached() !== null) {
        //     desired = Mat4.inverse(this.attached().times(Mat4.translation(0, 0, 10)));
        // } else {
        //     desired = this.initial_camera_location;
        // }
        // program_state.set_camera(desired);
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