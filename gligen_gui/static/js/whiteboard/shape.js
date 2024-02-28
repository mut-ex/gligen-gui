Whiteboard.Shape = class {
    constructor() {
      this.subscribers = {};
    }
  
    addEventListener(topic, callback) {
      if (!this.subscribers[topic]) {
        this.subscribers[topic] = [];
      }
      this.subscribers[topic].push(callback);
      return () => this.removeEventListener(topic, callback); // Return a removeEventListener function
    }
  
    removeEventListener(topic, callback) {
      if (!this.subscribers[topic]) return;
      this.subscribers[topic] = this.subscribers[topic].filter(
        (subscriber) => subscriber !== callback
      );
    }
  
    dispatchEvent(topic, data) {
      if (!this.subscribers[topic]) return;
      this.subscribers[topic].forEach((callback) => callback(data));
    }
  
    toggleVisibility() {
      this.visible = !this.visible;
      this.isDirty = true;
      this.dispatchEvent("shapeChanged", { shape: this });
  
      // this.dispatchEvent("shapeRequestRedraw", { shape: this });
    }
  
    hide() {
      this.visible = false;
      this.isDirty = true;
      this.dispatchEvent("shapeChanged", { shape: this });
  
      // this.dispatchEvent("shapeRequestRedraw", { shape: this });
    }
  
    show() {
      this.visible = true;
      this.isDirty = true;
      this.dispatchEvent("shapeChanged", { shape: this });
  
      // this.dispatchEvent("shapeRequestRedraw", { shape: this });
    }
  
    snap() {}
  
    draw() {}
  }