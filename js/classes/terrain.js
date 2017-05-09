/***
 * Denne klassen lager terrenget.
 */



class Terrain {
    constructor() {
        let self = this;
        this.state = State.getInstance(); // get the state

      //  this.heightData = new Array();
        // init heightdata matrix

        this.heightData = [];
        for(let i=0; i < 512; i++) {
            this.heightData[i] = []
        }

        let img = document.getElementById('heightmap')

     /*   for(let i = 0; i < 512; i++) {
            for(let j = 0; j < 512; j++) {

               let height = this.getHeight(j,i,img);

               this.heightData[j][i] = height;
            }
        }*/




        this.heightMapWidth = 512;
        this.heightMapDepth = 512;


        this.terrainMesh = this.lagFjellFraHeightMap();


    } // constructor

    /**
     * Lager fjell fra høydemap
     * @returns {THREE.Mesh}
     */

    lagFjellFraHeightMap() {
        let plane = new THREE.Mesh();
        let img = new Image();
        img.onload = () => {
            // Høydedata fra bilde
            let data = this.getHeightData(img);


            // Plan
            let geometry = new THREE.PlaneGeometry(512, 512, 511, 511);
            geometry.scale(70, 70, 70);
            let texture = new THREE.TextureLoader().load("textures/snow.jpg")
            texture.anisotropy = 4;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.format = THREE.RGBFormat;
            let material = new THREE.MeshLambertMaterial({
                map: texture,
                combine: THREE.MixOperation
            });
            plane = new THREE.Mesh(geometry, material);
            plane.rotateX(-Math.PI / 2)
            plane.receiveShadow = true;
            plane.castShadow = false;
            //set height of vertices


            for (let i = 0; i < plane.geometry.vertices.length; i++) {
                plane.geometry.vertices[i].z = data[i] * 50;
           //     this.heightData.push(plane.geometry.vertices[i]);
            }




          //  plane.material.map.repeat.set(2, 256);
            this.state.scene.add(plane);
        };
        img.src = "textures/mountain_heightmap2.png";


        return plane;
    }


    getHeight(x, z, img) {
        if(x < 0 || x >=512 || z<0 || z>=512) {
            return 0;
        }

        let canvas = this.state.canvas;
        canvas.width = img.width;
        canvas.height = img.height;

        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

        let pixelData = canvas.getContext('2d').getImageData(x, z, 1, 1).data;


        let summert = (pixelData[0] + pixelData[1] + pixelData[2]) / 12;

        return summert;

    }

    /**
     * Legger til en plangeometri med is
     * TODO: refleksjoner
     * @returns {THREE.Mesh}
     */
    addIce() {

        let geometry = new THREE.PlaneGeometry(512, 512, 511, 511);

        let texture = new THREE.TextureLoader().load("textures/ice.jpg");
        let material = new THREE.MeshPhongMaterial({
            //map: texture
            color: 0x996633,
            specular: 0x050505,
            shininess: 100
        });


        let iceMesh = new THREE.Mesh(geometry, material);
        iceMesh.rotateX(-Math.PI / 2)
        iceMesh.position.y = 1;
        this.state.scene.add(iceMesh)

        return iceMesh;
    }


    /***
     * Returnerer en array med høydedata for et gitt bilde. Brukes til heightmap
     * @param img
     * @param scale
     * @returns {Float32Array}
     */
    getHeightData(img, scale) {
        if (scale == undefined) scale = 1;
        this.state.canvas.width = img.width;
        this.state.canvas.height = img.height;
        let context = this.state.canvas.getContext('2d');

        let size = img.width * img.height;

        let data = new Float32Array(size);

        context.drawImage(img, 0, 0);

        for (let i = 0; i < size; i++) {
            data[i] = 0
        }

        let imgd = context.getImageData(0, 0, img.width, img.height);
        let pix = imgd.data;



        let j = 0;
        for (let i = 0; i < pix.length; i += 4) {
            let all = pix[i] + pix[i + 1] + pix[i + 2];
            data[j++] = all / (12 * scale);
        }

        return data;
    }


    /**
     * Returnerer terrainMesh
     * @returns {HeightMapMesh|*}
     */
    getMesh() {
        return this.terrainMesh;
    }


    /**
     * Kjøres ved rendring
     */
    update() {

    }

} // Terrain