/**
 * @author James Baicoianu / http://www.baicoianu.com/
 * Source: https://github.com/mrdoob/three.js/blob/master/examples/js/controls/FlyControls.js
 *
 * Adopted to common js by Andrei Kashcha
 */

var eventify = require('ngraph.events');

module.exports = fly;

function fly(camera, domElement, THREE) {
  domElement = domElement || document;
  domElement.setAttribute('tabindex', -1);

  var api = {
    rollSpeed: 0.005,
    movementSpeed: 1,
    dragToLook: true,
    autoForward: false,
    update: update
  };

  eventify(api);

  var tmpQuaternion = new THREE.Quaternion();
  var isMouseDown = 0;

  var moveState = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
    forward: 0,
    back: 0,
    pitchUp: 0,
    pitchDown: 0,
    yawLeft: 0,
    yawRight: 0,
    rollLeft: 0,
    rollRight: 0
  };

  var moveVector = new THREE.Vector3(0, 0, 0);
  var rotationVector = new THREE.Vector3(0, 0, 0);

  var moveArgs = {
    move: moveVector,
    rotate: rotationVector
  };

  domElement.addEventListener('mousemove', mousemove, false);
  domElement.addEventListener('mousedown', mousedown, false);
  domElement.addEventListener('mouseup', mouseup, false);

  domElement.addEventListener('keydown', keydown, false);
  domElement.addEventListener('keyup', keyup, false);

  updateMovementVector();
  updateRotationVector();

  return api;

  function update(delta) {
    var moveMult = delta * api.movementSpeed;
    var rotMult = delta * api.rollSpeed;

    camera.translateX(moveVector.x * moveMult);
    camera.translateY(moveVector.y * moveMult);
    camera.translateZ(moveVector.z * moveMult);

    tmpQuaternion.set(rotationVector.x * rotMult, rotationVector.y * rotMult, rotationVector.z * rotMult, 1).normalize();
    camera.quaternion.multiply(tmpQuaternion);

    // expose the rotation vector for convenience
    camera.rotation.setFromQuaternion(camera.quaternion, camera.rotation.order);
  }

  function keydown(event) {
    if (event.altKey) {
      return;
    }

    switch (event.keyCode) {
      case 87:
        /*W*/ moveState.forward = 1;
        break;
      case 83:
        /*S*/ moveState.back = 1;
        break;

      case 65:
        /*A*/ moveState.left = 1;
        break;
      case 68:
        /*D*/ moveState.right = 1;
        break;

      case 82:
        /*R*/ moveState.up = 1;
        break;
      case 70:
        /*F*/ moveState.down = 1;
        break;

      case 38:
        /*up*/ moveState.pitchUp = 1;
        break;
      case 40:
        /*down*/ moveState.pitchDown = 1;
        break;

      case 37:
        /*left*/ moveState.yawLeft = 1;
        break;
      case 39:
        /*right*/ moveState.yawRight = 1;
        break;

      case 81:
        /*Q*/ moveState.rollLeft = 1;
        break;
      case 69:
        /*E*/ moveState.rollRight = 1;
        break;
      default:
        return;
    }

    api.fire('move', moveArgs);
    updateMovementVector();
    updateRotationVector();
  }

  function keyup(event) {

    switch (event.keyCode) {
      case 87:
        /*W*/ moveState.forward = 0;
        break;
      case 83:
        /*S*/ moveState.back = 0;
        break;

      case 65:
        /*A*/ moveState.left = 0;
        break;
      case 68:
        /*D*/ moveState.right = 0;
        break;

      case 82:
        /*R*/ moveState.up = 0;
        break;
      case 70:
        /*F*/ moveState.down = 0;
        break;

      case 38:
        /*up*/ moveState.pitchUp = 0;
        break;
      case 40:
        /*down*/ moveState.pitchDown = 0;
        break;

      case 37:
        /*left*/ moveState.yawLeft = 0;
        break;
      case 39:
        /*right*/ moveState.yawRight = 0;
        break;

      case 81:
        /*Q*/ moveState.rollLeft = 0;
        break;
      case 69:
        /*E*/ moveState.rollRight = 0;
        break;
      default:
        return;
    }

    updateMovementVector();
    updateRotationVector();
    api.fire('move', moveArgs);
  }

  function mousedown(event) {
    if (domElement !== document) {
      domElement.focus();
    }

    event.preventDefault();
    event.stopPropagation();

    if (api.dragToLook) {
      isMouseDown = true;
    } else {
      switch (event.button) {
        case 0:
          moveState.forward = 1;
          break;
        case 2:
          moveState.back = 1;
          break;
      }

      updateMovementVector();
    }

    api.fire('move', moveArgs);
  }

  function mousemove(event) {
    if (!api.dragToLook || isMouseDown) {
      var container = getContainerDimensions();
      var halfWidth = container.size[0] / 2;
      var halfHeight = container.size[1] / 2;

      moveState.yawLeft = -((event.pageX - container.offset[0]) - halfWidth) / halfWidth;
      moveState.pitchDown = ((event.pageY - container.offset[1]) - halfHeight) / halfHeight;

      updateRotationVector();
      api.fire('move', moveArgs);
    }
  }

  function mouseup(event) {
    event.preventDefault();
    event.stopPropagation();

    if (api.dragToLook) {
      isMouseDown = false;
      moveState.yawLeft = moveState.pitchDown = 0;
    } else {
      switch (event.button) {
        case 0:
          moveState.forward = 0;
          break;
        case 2:
          moveState.back = 0;
          break;
      }
      updateMovementVector();
    }

    updateRotationVector();
    api.fire('move', moveArgs);
  }


  function updateMovementVector() {
    var forward = (moveState.forward || (api.autoForward && !moveState.back)) ? 1 : 0;

    moveVector.x = (-moveState.left + moveState.right);
    moveVector.y = (-moveState.down + moveState.up);
    moveVector.z = (-forward + moveState.back);
  }

  function updateRotationVector() {
    rotationVector.x = (-moveState.pitchDown + moveState.pitchUp);
    rotationVector.y = (-moveState.yawRight + moveState.yawLeft);
    rotationVector.z = (-moveState.rollRight + moveState.rollLeft);
  }

  function getContainerDimensions() {
    if (domElement !== document) {
      return {
        size: [domElement.offsetWidth, domElement.offsetHeight],
        offset: [domElement.offsetLeft, domElement.offsetTop]
      };
    } else {
      return {
        size: [window.innerWidth, window.innerHeight],
        offset: [0, 0]
      };
    }
  }
}
