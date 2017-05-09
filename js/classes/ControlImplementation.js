/***
 *
 * Denne klassen styrer First person kontrollen
 * @stian
 *
 */
class ControlImplementation {
    constructor() {
        let self = this;

        this.state = State.getInstance();
        this.controls = new THREE.PointerLockControls(this.state.camera);
        this.controlsEnabled = false;


        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.collision = false;


        this.state.scene.add(this.controls.getObject());


        this.mouseClickStart = undefined;
        this.mouseClickEnd = undefined;


        // Lages én gang
        this.raycaster = new THREE.Raycaster();

        // Treffbare objekter
        this.hindringer = [];

        // Våre eksplosjoner
        this.explosions = [];


        // Snøballer
        this.balls = [];
        this.ballMeshes = [];


        // Playerbody; en kule
        const mass = 50, radius = 10;
        this.sphereShape = new CANNON.Sphere(radius);
        this.cannonBody = new CANNON.Body({mass: mass});


        this.cannonBody.addShape(this.sphereShape);
        this.cannonBody.position.set(0, 5, 0);
        this.cannonBody.linearDamping = 0.9;
        this.state.world.add(this.cannonBody);


        //Cannon constants
        this.velocity = this.cannonBody.velocity;
        this.velocityFactor = 600;
        this.jumpVelocity = 100;
        this.quat = new THREE.Quaternion();
        this.contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
        this.upAxis = new CANNON.Vec3(0, 1, 0);
        this.inputVelocity = new THREE.Vector3();
        this.euler = new THREE.Euler();


        // Divs
        this.poengDiv = document.getElementById('poeng');
        this.blocker = document.getElementById('blocker');
        this.instructions = document.getElementById('instructions');
        this.shotVelocityDiv = document.getElementsByClassName('shotvelocity-wrap')[0];


        this._init();

        // Bindings
        document.addEventListener('keydown', this._onKeyDown.bind(this), false);
        document.addEventListener('keyup', this._onKeyUp.bind(this), false);
        document.addEventListener('mousedown', this._onMouseDown2.bind(this), false);
        document.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.cannonBody.addEventListener("collide", this.collide.bind(this));


    } // constrcuto

    collide(e) {

        let contact = e.contact;

        // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
        // We do not yet know which one is which! Let's check.
        if (contact.bi.id == this.cannonBody.id) { // bi is the player body, flip the contact normal
            contact.ni.negate(this.contactNormal);
        }
        else {
            this.contactNormal.copy(contact.ni); // bi is something else. Keep the normal as it is
        }

        // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
        if (this.contactNormal.dot(this.upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
            this.canJump = true;
    }


    /**
     * Håndterer _onKeyDown
     * @param event
     */
    _onKeyDown(event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                this.moveForward = true;
                break;

            case 37: // left
            case 65: // a

                this.moveLeft = true;

                break;

            case 40: // down
            case 83: // s
                this.moveBackward = true;

                break;

            case 39: // right
            case 68: // d
                this.moveRight = true;

                break;

            case 32: // space
                if (this.canJump === true) {
                    this.velocity.y = this.jumpVelocity;
                    //  this.velocity.y = 100;
                }
                this.canJump = false;
                break;

        }

    };


    /**
     * Håndterer _onKeyUp
     * @param event
     */

    _onKeyUp(event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;

            case 37: // left
            case 65: // a
                this.moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                this.moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                this.moveRight = false;
                break;

        }

    };


    /***
     * For snøballer
     * @param event
     * @private
     */
    _onMouseDown2(event) {
        if (!this.controlsEnabled) return;
        this.mouseClickStart = +new Date();

        $('.shotvelocity-bar')[0].style.left = '0';
        this.shotVelocityDiv.style.display = 'block';



            //let getPercent = +this.shotVelocityDiv.dataset.progressPercent / 100;
            let getPercent = 1;
            let getProgressWrapWidth = $(this.shotVelocityDiv).width();
            let progressTotal = getPercent * getProgressWrapWidth;
            console.log(progressTotal)
            let animationLength = 1500;

            // on page load, animate percentage bar to data percentage length
            // .stop() used to prevent animation queueing
            $('.shotvelocity-bar').stop().animate({
                left: progressTotal
            }, animationLength);


        $('.shotvelocity-wrap').className += " pulse";



    }

    _onMouseUp() {
        if (!this.controlsEnabled) return;

        this.shotVelocityDiv.style.display = 'none';

        this.mouseClickEnd = +new Date();
        let diff = this.mouseClickEnd - this.mouseClickStart;
        if(diff > 1300) diff = 1300;

        let ballShape = new CANNON.Sphere(2);
        let ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
        let shootDirection = new THREE.Vector3();
        let shootVelo = diff;



        let material = new THREE.MeshPhongMaterial({
           color: 0xffffff,
            // map: new THREE.TextureLoader().load("textures/snow.jpg"),
           // normalMap: new THREE.TextureLoader().load("textures/snow_n.jpg"),
            blending: THREE.AdditiveBlending,
            transparent: false,
            shininess: 1000,
            specular: 0xffffff,
            shading: THREE.FlatShading
        });


        let x = this.cannonBody.position.x;
        let y = this.cannonBody.position.y;
        let z = this.cannonBody.position.z;
        let ballBody = new CANNON.Body({mass: 50});
        ballBody.addShape(ballShape);
        let ballMesh = new THREE.Mesh(ballGeometry, material);
        this.state.world.add(ballBody);
        this.state.scene.add(ballMesh);
        ballMesh.castShadow = true;
        ballMesh.receiveShadow = true;


        this.balls.push(ballBody);
        this.ballMeshes.push(ballMesh);


        let direction = new THREE.Vector3(0, 0.7, 1);

        this.controls.getDirection(direction);

        // Setter raycaster til å peke på der musen klikket
        this.raycaster.set(this.controls.getObject().position, direction);



        shootDirection = direction;


        ballBody.velocity.set(shootDirection.x * shootVelo,
            shootDirection.y * shootVelo,
            shootDirection.z * shootVelo);

        // Move the ball outside the player sphere
        x += shootDirection.x * (this.sphereShape.radius * 1.02 + ballShape.radius);
        y += shootDirection.y * (this.sphereShape.radius * 1.02 + ballShape.radius);
        z += shootDirection.z * (this.sphereShape.radius * 1.02 + ballShape.radius);
        ballBody.position.set(x, y, z);
        ballMesh.position.set(x, y, z);
    }


    /***
     * Håndterer museklikk
     * @param event
     */
    _onMouseDown(event) {

        if (this.controlsEnabled) {

            event.preventDefault();

            let direction = new THREE.Vector3(0, 0, 1);

            this.controls.getDirection(direction);

            // Setter raycaster til å peke på der musen klikket
            this.raycaster.set(this.controls.getObject().position, direction);


            // Har vi en "_hit" eller "_miss" med våre hindringer?
            let intersects = this.raycaster.intersectObjects(this.hindringer);
            if (intersects.length > 0) {
                let object = intersects[0]
                let explosion = new Explosion(object.point.x, object.point.y, object.point.z);

                this.state.scene.add(explosion.getMesh());
                this.explosions.push(explosion);

                this.state.scene.remove(object.object)
                let index = this.hindringer.indexOf(object.object)

                this.hindringer.splice(index, 1)
                this.state.numberOfCubes--;

                this._hit();

                // Bommet!
            } else {
                this._miss();
            }
        }

    }


    /**
     * TREFF
     */
    _hit() {
        let old = document.getElementById("hit");
        if (old) old.parentNode.removeChild(old);

        let hitElement = document.createElement("div");
        hitElement.setAttribute("id", "hit");
        hitElement.textContent = "+10";
        document.body.appendChild(hitElement);

        let nyPoeng = parseInt(this.poengDiv.textContent) + 10;
        this.poengDiv.textContent = nyPoeng;
    }

    /**
     * BOM
     */
    _miss() {
        let old = document.getElementById("miss");
        if (old) old.parentNode.removeChild(old);

        let missElement = document.createElement("div");
        missElement.setAttribute("id", "miss");
        missElement.textContent = "-10";
        document.body.appendChild(missElement);

        let poeng = parseInt(this.poengDiv.textContent);
        if (poeng > 0) {
            let nyPoeng = poeng - 10;
            this.poengDiv.textContent = nyPoeng;
        }

    }


    /**
     * Oppdaterer FPS-kontroll når app rendrer
     * Translerer
     * @param time
     */

    update(time) {
        if (!this.controlsEnabled) return;


        let delta = ( time - this.state.prevTime ) / 1000;
        this.inputVelocity.set(0, 0, 0);

        if (this.moveForward) {
            this.inputVelocity.z = -this.velocityFactor * delta;

        }
        if (this.moveBackward) {
            this.inputVelocity.z = this.velocityFactor * delta;
        }

        if (this.moveLeft) {
            this.inputVelocity.x = -this.velocityFactor * delta;
        }
        if (this.moveRight) {
            this.inputVelocity.x = this.velocityFactor * delta;
        }

        // Convert velocity to world coordinates
        this.euler.x = this.controls.getPitchObject().rotation.x;
        this.euler.y = this.controls.getObject().rotation.y;
        this.euler.order = "XYZ";
        this.quat.setFromEuler(this.euler);
        this.inputVelocity.applyQuaternion(this.quat);
        //quat.multiplyVector3(inputVelocity);

        // Add to the object
        this.velocity.x += this.inputVelocity.x;
        this.velocity.z += this.inputVelocity.z;

        this.controls.getObject().position.copy(this.cannonBody.position)

        // Oppdater eksplosjoner
        this.explosions.forEach((object) => {
            object.update();
        });


        // Update ball positions
        for (let i = 0; i < this.balls.length; i++) {
            this.ballMeshes[i].position.copy(this.balls[i].position);
            this.ballMeshes[i].quaternion.copy(this.balls[i].quaternion);
        }

    }


    /**
     * Setter opp PointerLockControls
     */
    _init() {
        let self = this;
        let havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

        if (havePointerLock) {

            let element = document.body;

            let pointerlockchange = function (event) {

                if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {

                    self.controlsEnabled = true;
                    self.controls.enabled = true;

                    self.blocker.style.display = 'none';

                } else {
                    self.controlsEnabled = false;
                    self.controls.enabled = false;

                    self.blocker.style.display = '-webkit-box';
                    self.blocker.style.display = '-moz-box';
                    self.blocker.style.display = 'box';

                    self.instructions.style.display = '';

                }

            };

            let pointerlockerror = function (event) {

                self.instructions.style.display = '';

            };

            // Hook pointer lock state change events
            document.addEventListener('pointerlockchange', pointerlockchange, false);
            document.addEventListener('mozpointerlockchange', pointerlockchange, false);
            document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

            document.addEventListener('pointerlockerror', pointerlockerror, false);
            document.addEventListener('mozpointerlockerror', pointerlockerror, false);
            document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

            instructions.addEventListener('click', function (event) {

                instructions.style.display = 'none';

                // Ask the browser to lock the pointer
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

                if (/Firefox/i.test(navigator.userAgent)) {

                    let fullscreenchange = function (event) {

                        if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

                            document.removeEventListener('fullscreenchange', fullscreenchange);
                            document.removeEventListener('mozfullscreenchange', fullscreenchange);

                            element.requestPointerLock();
                        }

                    };

                    document.addEventListener('fullscreenchange', fullscreenchange, false);
                    document.addEventListener('mozfullscreenchange', fullscreenchange, false);

                    element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

                    element.requestFullscreen();

                } else {

                    element.requestPointerLock();

                }

            }, false);

        } else {

            self.instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

        }

    }
}