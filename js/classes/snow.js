class Snow {
    constructor() {
        this.state = State.getInstance(); // get the state
        this.antallSnofnugg = 2000;
        this.snoMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 2,
            map: new THREE.TextureLoader().load("textures/snowflake.png"),
            blending: THREE.AdditiveBlending,
            depthTest: true,
            transparent: true
        });
        this.particles = new THREE.Geometry();
        this._lagSnofnugg();
        this.particleSystem = new THREE.Points(this.particles, this.snoMaterial);


    }

    /**
     * Lager N snøfnugg med tilfeldig x,y,z posisjon
     * @private
     */
    _lagSnofnugg() {
        for (let i = 0; i < this.antallSnofnugg; i++) {
            let pX = Math.random() * 500 - 250,
                pY = Math.random() * 500 - 250,
                pZ = Math.random() * 500 - 250,
                particle = new THREE.Vector3(pX, pY, pZ);

            // Gir vektoren velocity egenskap for at snøen skal være mer realistisk
            particle.velocity = {};
            particle.velocity.y = 0;
            this.particles.vertices.push(particle);
        }
    }

    _simulateSnow() {
        let pCount = this.antallSnofnugg;
        while (pCount--) {
            let particle = this.particles.vertices[pCount];
            if (particle.y < -200) {
                particle.y = 200;
                particle.velocity.y = 0;
            }

            particle.velocity.y -= Math.random() * .02;
            particle.y += particle.velocity.y;
        }

        this.particles.verticesNeedUpdate = true;
    }

    /**
     * Her vil vi at "snøskyen" vår skal holde følge med kameraet
     */
    update() {
        this._simulateSnow();
        this.particleSystem.position.copy( this.state.controlImp.controls.getObject().position );
       // this.particleSystem.rotation.copy( this.state.camera.rotation );
        this.particleSystem.updateMatrix();
        this.particleSystem.translateZ( - 10 );
    }

    getMesh() {
        return this.particleSystem;
    }


}