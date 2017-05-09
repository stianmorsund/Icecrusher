/**
 * Denne klassen tar seg av "eksplosjon", dvs isbiter som flyr når man skyter en isbit
 */


class Explosion {
    constructor(posX, posY, posZ) {

        this.X = posX;
        this.Y = posY;
        this.Z = posZ;
        let self = this;
        this.state = State.getInstance();



        this.movementSpeed = 200;
        this.totalObjects = 100;
        this.objectSize = 10;
        this.sizeRandomness = 4000;

        this.dirs = [];
        this.parts = [];


        this.geometry = new THREE.Geometry();
        this.material = new THREE.PointsMaterial({
            size: this.objectSize * 5,
            //color: 0xffcc00,
            map: new THREE.TextureLoader().load("textures/icespline2.png"),
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        this.explodeAnimation((Math.random() * this.sizeRandomness) - (this.sizeRandomness / 2), (Math.random() * this.sizeRandomness) - (this.sizeRandomness / 2));

        this.particleSystem = new THREE.Points(this.geometry, this.material);


    } // constcutr


    explodeAnimation(x, y) {


        for (let i = 0; i < this.totalObjects; i++) {

            let pX = this.X,
                pY = this.Y,
                pZ = this.Z,
                particle = new THREE.Vector3(pX, pY, pZ);


            //particle.velocity = {};
            //particle.velocity.y = 0;
            this.geometry.vertices.push(particle);


            this.dirs.push({
                x: (Math.random() * this.movementSpeed) - (this.movementSpeed / 2),
                y: (Math.random() * this.movementSpeed) - (this.movementSpeed / 2),
                z: (Math.random() * this.movementSpeed) - (this.movementSpeed / 2)
            });
        }

    }

    update() {

        let pCount = this.totalObjects;
        while (pCount--) {

            let particle = this.geometry.vertices[pCount]
            particle.y += this.dirs[pCount].y;
            particle.x += this.dirs[pCount].x;
            particle.z += this.dirs[pCount].z;


        }
        this.geometry.verticesNeedUpdate = true;

    }

    getMesh() {
        return this.particleSystem;
    }


} // class