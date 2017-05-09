class Lava {
    constructor() {
        var texture = new THREE.TextureLoader().load('textures/fire.jpg'); //lava texture from http://opengameart.org/sites/default/files/fire.jpg
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5);
        this.plane = new THREE.Mesh(new THREE.PlaneGeometry(470, 470),
            new THREE.MeshPhongMaterial({
                //emissive: 0xffcb00,    //0x9966FF
                //specular: 0xffcb00,
                //shininess: 50,
                map: texture,
                side: THREE.DoubleSide
            })
        );
        this.plane.rotation.x = 90 * (Math.PI / 180);
        this.plane.position.y = 220;
        this.plane.position.x = 2060;
        this.plane.position.z = 100;
        this.plane.name = "plane";
        //this.state.scene.add(plane);
    }


    getMesh() {
        return this.plane;
    }


    update() {
        this.plane.material.map.offset.x += 0.04;
        this.plane.material.map.offset.y += 0.04;
    }
}