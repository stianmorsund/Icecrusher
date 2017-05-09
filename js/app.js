let instance = null;

/** Singleton: Statisk klasse som kun kan ha en instanse av **/

class State {
    constructor() {

        // Singleton setup
        if (instance) {
            return instance;
        } else {
            instance = this;
        }

        // Set our "global" variables
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width / this.height;
        this.fov = 45;
        this.near = 0.1;
        this.far = 100000;
        this.numberOfCubes = 20;


        this.container = document.getElementById("container");
        this.container.width = window.innerWidth;
        this.container.height = window.innerHeight;

        this.canvas = document.createElement("canvas");
        this.scene = new THREE.Scene();


        //Fog
        this.scene.fog = new THREE.FogExp2(0x21345f, 0.00010);
        this.terrain = new Terrain();



        //Klokke
        this.clock = new THREE.Clock();

        // Kamera
        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
        this.scene.add(this.camera);


        this.prevTime = performance.now();



        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);


        //Stats
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.container.appendChild(this.stats.domElement);


        // Cannon

        // Setup our world
        this.world = new CANNON.World();
        this.world.quatNormalizeSkip = 0;
        this.world.quatNormalizeFast = false;

        let solver = new CANNON.GSSolver();

        this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.world.defaultContactMaterial.contactEquationRelaxation = 4;

        solver.iterations = 7;
        solver.tolerance = 0.1;
        let split = true;
        if(split)
            this.world.solver = new CANNON.SplitSolver(solver);
        else
            this.world.solver = solver;

        this.world.gravity.set(0,-100,0);
        this.world.broadphase = new CANNON.NaiveBroadphase();

        // Create a slippery material (friction coefficient = 0.0)
        let physicsMaterial = new CANNON.Material("slipperyMaterial");


        // Defines what happens when two materials meet.

        var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
            physicsMaterial,{
                friction: 40,
                restitution: 40
            }
        );
        // We must add the contact materials to the world
        this.world.addContactMaterial(physicsContactMaterial);


        // Create a plane
        var groundShape = new CANNON.Plane();
        var groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        this.world.add(groundBody);


        this.controlImp = new ControlImplementation();

        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );

        return instance;
    }

    // Use this to get a reference to State object
    static getInstance() {
        if (instance) {
            return instance;
        } else {
            return new State();
        }
    }

    onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
}


} // State


/***
 * Applikasjonen vår
 */
class App {
    constructor() {

        let self = this;
        this.state = State.getInstance(); // get the state
        this.objects = [];
        this.boxes = [];
        this.boxMeshes = [];


        this.state.renderer.setClearColor(0x21276a);
        this.state.renderer.setSize(this.state.width, this.state.height);
        // this.state.camera.position.set(-this.state.worldMapWidth/5, 2*this.state.worldMapMaxHeight, 0);


        //this.add(this.state.terrain);

        this.skybox = new Skybox();
        this.add(this.skybox);
       //this.add(new Lava())
       this.add(new Snow());
        this.add(new Light());

        // Legger til crosshair til kameraet
        this.addCrosshair();
        this.addIceCubes(this.state.numberOfCubes);


        this.render();

    }


    /***
     * Render. Går gjennom alle objektene i scenen og kjører oppdateringsmetoden
     */
    render() {

        // Perform the render of the scene from our camera's point of view
        this.state.renderer.render(this.state.scene, this.state.camera);

        // this line loops the render callw, remember to bind our context so we can access our stuff!
        window.requestAnimFrame(this.render.bind(this));

        let dt = 1/60;
        this.state.world.step(dt);

        // Oppdatere controls, må sette ny delta time, usikkert hvorfor THREE.Clock ikke fungerer på tilsvarende måte
        var time = performance.now();
        this.state.controlImp.update(time);
        this.state.prevTime = time;


        // Kjører update på alt som ligger i scenen
        this.objects.forEach((object) => {
            object.update();
        });



        // Update box positions
        for(let i=0; i<this.boxes.length; i++){
            this.boxMeshes[i].position.copy(this.boxes[i].position);
            this.boxMeshes[i].quaternion.copy(this.boxes[i].quaternion);
        }


        this.skybox.getMesh().position.copy(this.state.controlImp.controls.getObject().position)


        // Oppdatererer stats
        this.state.stats.update();
    }

    /***
     * Legger til et object i scenen
     * @param mesh
     */
    add(mesh) {
        this.objects.push(mesh);
        this.state.scene.add(mesh.getMesh());
    }

    /**
     * Legger et crosshair til kameraet og plasserer det fiksert
     * midt på skjermen
     */
    addCrosshair() {

        let material = new THREE.LineBasicMaterial({color: 0xAAFFAA});

        // Størrelse
        let x = 0.01, y = 0.01;

        let geometry = new THREE.Geometry();

        geometry.vertices.push(new THREE.Vector3(0, y, 0));
        geometry.vertices.push(new THREE.Vector3(0, -y, 0));
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(x, 0, 0));
        geometry.vertices.push(new THREE.Vector3(-x, 0, 0));

        let crosshair = new THREE.Line(geometry, material);

        // Plasser i midten av skjermen...
        let crosshairPercentX = 50;
        let crosshairPercentY = 50;
        let crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
        let crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;

        crosshair.position.x = crosshairPositionX * this.state.camera.aspect;
        crosshair.position.y = crosshairPositionY;

        crosshair.position.z = -0.3;
        // legg til kamera...
        this.state.camera.add(crosshair);

    }

    /**
     * Lager isbiter med tilfeldig plassering
     * @param numberOfCubes
     */
    addIceCubes(numberOfCubes) {

        for (let i = 0; i < numberOfCubes; i++) {
            // Tilfeldig integer mellom 20-100
            let randSize = Math.floor(Math.random() * (10 - 1 + 1)) + 1;

            // Tilfeldig integer mellom 0-100
            let randPosX = Math.floor(Math.random() * (3000 + 1));
            let randPosZ = Math.floor(Math.random() * (3000 + 1));
            let randPosY = Math.floor(Math.random() * (30000 + 1));

            let icecube = new IceCube({
                width: randSize,
                height: randSize,
                depth: randSize,
                posX: randPosX,
                posZ: randPosZ,
                posY: randPosY
            });

            icecube.castShadow = true;

            this.add(icecube);
            //this.state.controlImp.hindringer.concat(icecube.getMesh());

            // En isbit er en "hindring"!
            this.state.controlImp.hindringer.push(icecube.getMesh());

            // Add to cannon world
            this.state.world.add(icecube.boxBody);

            this.state.scene.add(icecube.getMesh());
            this.boxes.push(icecube.boxBody);
            this.boxMeshes.push(icecube.getMesh());

        }




    }

    displayFinishedBox() {
            let box = document.getElementById("ferdig");
            box.textContent = 'Spillet er ferdig!';
            box.style.display = 'block';
    }




} // App


// shim layer with setTimeout fallback (ignore this)
window.requestAnimFrame = (() => {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();