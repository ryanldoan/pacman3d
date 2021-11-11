import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene, Shader
} = tiny;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}

// Example A: Define a triangle
class TriangleFace extends Shape {
    constructor() {
        super("position", "normal",);
        this.arrays.position = Vector3.cast(
            [0, 0, 0], [1, 0, 0], [0, 3, 0], [1, 4, 0], [3, 0, 0]
        );
        this.arrays.normal = Vector3.cast(
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]
        );

        // for triangles
        this.indices.push(
            0, 1, 2,
            1, 2, 3,
            3, 1, 4
        );

        // // for strip
        // this.indices.push(
        //     0, 2, 1, 3, 4
        // );
    }
}

// Example B: Define lines
class Axis extends Shape {
    constructor() {
        super("position", "color");
        this.arrays.position = Vector3.cast(
            [0, 0, 0], [5, 0, 0],
            [0, 0, 0], [0, 5, 0],
            [0, 0, 0], [0, 0, 5]
        );
        this.arrays.color = [
            vec4(1, 0, 0, 1), vec4(1, 0, 0, 1),
            vec4(0, 1, 0, 1), vec4(0, 1, 0, 1),
            vec4(0, 0, 1, 1), vec4(0, 0, 1, 1),
        ];
        this.indices = false; // not necessary
    }
}

class Cube_Outline extends Shape {
    constructor() {
        super("position", "color");
        //  TODO (Requirement 5).
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
    }
}

// Example C: Triangle Strip
class Pyramid extends Shape {
    constructor() {
        super("position", "normal");
        this.arrays.position = Vector3.cast(
            [1, 0, 0], [0, 0, -1], [-1, 0, 0], [0, 0, 1], [0, 2, 0]
        );
        this.arrays.normal = Vector3.cast(
            [1, 0, 0], [0, 0, -1], [-1, 0, 0], [0, 0, 1], [0, 1, 0]
        );
        this.indices.push(0, 1, 4, 2, 3, 1, 0, 4, 3);
    }
}

// Example C2: Face Normal and Vertex Normal
class Pyramid_Face extends Shape {
    constructor() {
        super("position", "normal");
        this.arrays.position = Vector3.cast(
            [1, 0, 0], [0, 0, -1], [0, 2, 0],
            [0, 0, -1], [-1, 0, 0], [0, 2, 0],
            [-1, 0, 0], [0, 0, 1], [0, 2, 0],
            [0, 0, 1], [1, 0, 0], [0, 2, 0],
            [0, 0, 1], [1, 0, 0], [0, 0, -1],
            [-1, 0, 0], [0, 0, 1], [0, 0, -1],
        );
        this.arrays.normal = Vector3.cast(
            [2, -2, 1], [2, -2, 1], [2, -2, 1],
            [-2, -2, 1], [-2, -2, 1], [-2, -2, 1],
            [-2, 2, 1], [-2, 2, 1], [-2, 2, 1],
            [2, 2, 1], [2, 2, 1], [2, 2, 1],
            [0, -1, 0],[0, -1, 0],[0, -1, 0],
            [0, -1, 0],[0, -1, 0],[0, -1, 0],
        );
    }
}

class Cube_Single_Strip extends Shape {
    constructor() {
        super("position", "normal");
        // TODO (Requirement 6)
    }
}

class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'cube': new Cube(),
            'outline': new Cube_Outline(),
            'tri': new TriangleFace(), // Example A
            'axis': new Axis(), // Example B
            'pyramid': new Pyramid(), // Example C
            'pyramid_face': new Pyramid_Face(), // Example C2
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
        this.front_back = new Material(new Front_Back_Shader());
        this.fake_camera = new Material(new Fake_Camera_Shader());
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.look_at(vec3(8,8,8), vec(0,0,0), vec(0,1,0)));
            // // This is used by Example F
            // program_state.set_camera(Mat4.look_at(vec3(5,5,15), vec(0,2,0), vec(0,1,0)));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}

export class Demo2 extends Base_Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */
    set_colors() {
        // TODO:  Create a class member variable to store your cube's colors.
        // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
        // Hint2: You can consider add a constructor for class Demo2, or add member variables in Base_Scene's constructor.
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change Colors", ["c"], this.set_colors);
        // Add a button for controlling the scene.
        this.key_triggered_button("Outline", ["o"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
        });
        this.key_triggered_button("Sit still", ["m"], () => {
            this.hover = !this.hover; // Example H
        });
    }

    draw_box(context, program_state, model_transform) {
        // TODO:  Helper function for requirement 3 (see hint).
        //        This should make changes to the model_transform matrix, draw the next box, and return the newest model_transform.
        // Hint:  You can add more parameters for this function, like the desired color, index of the box, etc.

        return model_transform;
    }

    display(context, program_state) {
        super.display(context, program_state);
        // const blue = hex_color("#1a9ffa");
        let model_transform = Mat4.identity();

        // Example for drawing a cube, you can remove this line if needed
        // this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color:blue}));

        // // Example A
        // this.shapes.tri.draw(context, program_state, model_transform,
        //     this.materials.plastic.override({color:color(1,1,1,1)}),
        //     "TRIANGLES"); // you can omit the last parameter

        // Example B
        this.shapes.axis.draw(context, program_state, model_transform, this.white, "LINES");

        // // Example C
        // this.shapes.pyramid.draw(context, program_state, model_transform,
        //     this.materials.plastic.override({color:color(0,1,1,1)}),
        //     "TRIANGLE_STRIP");

        // // Example C2
        // this.shapes.pyramid_face.draw(context, program_state, model_transform,
        //     this.materials.plastic.override({color:color(0,1,1,1)}),
        //     "TRIANGLES"); // you can omit the last parameter

        const white = hex_color("#ffffff");
        const red   = hex_color("#ff0000");
        const green = hex_color("#00ff00");
        const blue  = hex_color("#0000ff");

        // // Example D: translate transformation
        // this.shapes.cube.draw(context, program_state, Mat4.identity(),
        //     this.materials.plastic.override({color:white}) );
        // this.shapes.cube.draw(context, program_state, Mat4.translation( 4, 0, 0),
        //     this.materials.plastic.override({color:red}) );
        // this.shapes.cube.draw(context, program_state, Mat4.translation( 0, 4, 0),
        //     this.materials.plastic.override({color:green}) );
        // this.shapes.cube.draw(context, program_state, Mat4.translation( 0, 0, 4),
        //     this.materials.plastic.override({color:blue}) );

        // // Example E: scale transformation
        // this.shapes.cube.draw(context, program_state, Mat4.scale(1, 2, 3),
        //     this.materials.plastic.override({color:white}) );

        // // Example F: rotation transformation
        // this.shapes.cube.draw(context, program_state, Mat4.identity(),
        //     this.materials.plastic.override( {color:white}) );
        // let base_transform = Mat4.translation(8, 0, 0);
        // this.shapes.cube.draw(context, program_state, base_transform,
        //     this.materials.plastic.override({color:red}) );
        // let rotation_transform = Mat4.rotation(Math.PI / 4.0, 0, 0, 1).times(base_transform)
        // this.shapes.cube.draw(context, program_state, rotation_transform,
        //     this.materials.plastic.override( {color:green}) );
        // rotation_transform = Mat4.rotation( Math.PI / 4.0, 0, 1, 0).times(base_transform)
        // this.shapes.cube.draw(context, program_state, rotation_transform,
        //     this.materials.plastic.override({color:blue}) );

        // // Example G: animation
        // let t = program_state.animation_time / 1000.0; // ms -> s
        // let Tr = Mat4.translation(4 * Math.sin(t), 2 * Math.cos(t), 0);
        // let Sc = Mat4.scale(1, Math.sin(t), Math.cos(t));
        // let Rt = Mat4.rotation(t * Math.PI / 4, 1, 0, 0);
        // let cube_color = color(1/2+Math.sin(t)/2, 1/2+Math.cos(t/2)/2, 1, 1);
        // this.shapes.cube.draw(context, program_state, Tr.times(Rt).times(Sc),
        //     this.materials.plastic.override({color:cube_color}) );

        // // Example H: button and events
        // let t = program_state.animation_time / 1000.0; // ms -> s
        // if (this.hover) { // also see line 182.
        //     t = 0;
        // }
        // let Tr = Mat4.translation(4 * Math.sin(t), 2 * Math.cos(t), 0);
        // let Sc = Mat4.scale(1, Math.sin(t), Math.cos(t));
        // let Rt = Mat4.rotation(t * Math.PI / 4, 1, 0, 0);
        // let cube_color = color(1/2+Math.sin(t)/2, 1/2+Math.cos(t/2)/2, 1, 1);
        // this.shapes.cube.draw(context, program_state, Tr.times(Rt).times(Sc),
        //     this.materials.plastic.override({color:cube_color}) );

        // // Example I: front face and back face
        // this.shapes.tri.draw(context, program_state, model_transform, this.front_back, "TRIANGLE_STRIP");
        // // rotate the camera over time
        // let t = program_state.animation_time / 1000.0; // ms -> s
        // let camera_pos = vec3(Math.cos(t) * 8, 8, Math.sin(t) * 8);
        // program_state.set_camera(Mat4.look_at(camera_pos, vec(0,0,0), vec(0,1,0)));

        // // Example J: culling faces
        // let gl = context.context;
        // gl.enable(gl.CULL_FACE);
        // gl.cullFace(gl.BACK);
        // this.shapes.tri.draw(context, program_state, model_transform, this.materials.plastic);
        // // rotate the camera over time
        // let t = program_state.animation_time / 1000.0; // ms -> s
        // let camera_pos = vec3(Math.cos(t) * 8, 8, Math.sin(t) * 8);
        // program_state.set_camera(Mat4.look_at(camera_pos, vec(0,0,0), vec(0,1,0)));

        // Example K: fake camera rendering
        let t = program_state.animation_time / 1000.0; // ms -> s
        let fake_camera_pos = vec3(Math.cos(t) * 4, 4, Math.sin(t) * 4);
        program_state.fake_camera_inverse = Mat4.look_at(fake_camera_pos, vec(0,0,0), vec(0,1,0));
        this.shapes.cube.draw(context, program_state, Mat4.identity(), this.fake_camera);
        // draw a small axis representing the Camera Coordinate System.

        let fake_camera_matrix = Mat4.inverse(program_state.fake_camera_inverse);
        this.shapes.axis.draw(context, program_state,
            fake_camera_matrix.times(Mat4.scale(.3, .3, .3)),
            this.white, "LINES");
    }
}

// Shader for Example I
class Front_Back_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
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
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
            gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        return this.shared_glsl_code() + `
        void main(){
            if (gl_FrontFacing) {
                gl_FragColor = vec4( 1, 0, 0, 1 );
            } else { 
                gl_FragColor = vec4( 0, 0, 1, 1 );
            }
        }`;
    }
}

// Shader for Example I
class Fake_Camera_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
        // define the uniform fake_camera_inverse
        if (graphics_state.fake_camera_inverse !== undefined) {
            context.uniformMatrix4fv(gpu_addresses.fake_camera_inverse, false,
                Matrix.flatten_2D_to_1D(graphics_state.fake_camera_inverse.transposed()));
        } else {
            context.uniformMatrix4fv(gpu_addresses.fake_camera_inverse, false,
                Matrix.flatten_2D_to_1D(graphics_state.camera_inverse.transposed()));
        }
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        uniform mat4 fake_camera_inverse;
        varying vec4 position_WCS;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
            gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
            position_WCS = model_transform * vec4( position, 1.0 );
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        return this.shared_glsl_code() + `
        #define M_PI 3.1415926535897932384626433832795
        void main(){
            vec4 fake_position_VCS = fake_camera_inverse * position_WCS;
            float distance = -fake_position_VCS.z;
            float up_distance = fake_position_VCS.y;
            float right_distance = fake_position_VCS.x;
            gl_FragColor = vec4( 0.5 + 0.5 * cos(distance * M_PI), 0.5 + 0.5 * sin(distance * M_PI), .5, 1 );
            //if (right_distance > 0.0) {
            //    gl_FragColor = vec4(1, 0, 0, 1);
            //} else {
            //    gl_FragColor = vec4(0, 0, 1, 1);
            //}
        }`;
    }
}