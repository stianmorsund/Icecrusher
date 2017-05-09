
class Skybox {

    constructor() {

        let path = "textures/skybox/skyer/";
        let format = '.jpg';
        let urls = [
            path + 'front' + format,
            path + 'back' + format,
            path + 'up' + format,
            path + 'down' + format,
            path + 'right' + format,
            path + 'left' + format

        ];

        let url = [path]


        let shader = THREE.ShaderLib["cube"];
        shader.uniforms["tCube"].value = new THREE.ImageUtils.loadTextureCube(urls);



       let material = new THREE.ShaderMaterial({

            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide


        });

/*
        let loader = new THREE.CubeTextureLoader();

        let textureCube = loader.load([urls[5],urls[4],urls[3],urls[2],urls[1],urls[0]])
        let material = new THREE.MeshBasicMaterial({
            envMap:textureCube,
            side:THREE.BackSide
        });*/



        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1000,1000,1000), material)


        //this.state.scene.add(new THREE.Mesh(new THREE.BoxGeometry(100000, 100000, 100000), material));

    }

    getMesh() {
        return this.mesh;
    }

    update() {

    }

}
