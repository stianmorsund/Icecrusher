class Hands {
    constructor() {
        let self = this;
        this.state = State.getInstance();
        this.mesh = null

        this.shooting = false;

        let texture =  new THREE.TextureLoader().load("textures/selbu.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5,5)

        let material = new THREE.MeshLambertMaterial({
            map: texture,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            transparent: false,
            shading: THREE.FlatShading
        });

        this.boundingbox = new THREE.Box3();
        let loader = new THREE.OBJLoader(  );
        loader.load( 'models/arm.obj',  ( object ) => {

            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = material;
                }
            } );



            this.mesh = object.children[0]
            this.mesh.receiveShadow = true;

            this.mesh.position.set(3,-6,-10)
            this.mesh.rotateX(Math.PI / 5)
            this.mesh.scale.set(.7,.7,.7)

           //this.boundingbox.setFromObject(this.mesh);


            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;

           self.state.camera.add(this.mesh)

        //console.log(self.mesh)


            //  self.state.scene.add( object );
        } );


      //  console.log(self.mesh)


    }


    update() {

        if(this.shooting) {
            this.mesh.rotateX(Math.PI / 5)
            this.mesh.rotateX(-Math.PI / 5)
            this.shooting = false;
        }


    }
    getMesh() {
        return this.mesh;
    }






}