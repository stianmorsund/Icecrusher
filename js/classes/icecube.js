/**
 * Modell for en icecube
 */

class IceCube {
    constructor(options) {
        this.geometry = new THREE.BoxGeometry(options.width, options.height, options.depth);
        this.material = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load("textures/icecube.jpg"),
            blending: THREE.AdditiveBlending,
            depthTest: true,
            transparent: false,
            shininess: 20,
            specular: 0xffffff,
            shading: THREE.FlatShading

        });


        let halfExtents = new CANNON.Vec3(options.width, options.height, options.depth);
        let boxShape = new CANNON.Box(halfExtents);
        let boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);


        let x = options.posX;
        let y = options.height / 2;
        let z = options.posZ;
        this.boxBody = new CANNON.Body({ mass: 10 });
        this.boxBody.addShape(boxShape);

        this.mesh = new THREE.Mesh(boxGeometry, this.material);


        this.boxBody.position.set(x, y, z);
        this.mesh.position.set(x, y, z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;


        this.mesh.boundingBox = new THREE.Box3().setFromObject(this.getMesh());


    }

    update() {
        //this.mesh.rotation.x += 0.03;
        //this.mesh.position.y += 2;
    }

    getMesh() {
        return this.mesh;
    }
}

