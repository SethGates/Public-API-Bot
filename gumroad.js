const https = require("https");
const fh = require("fs");

class GrListener {
  url = "https://api.gumroad.com/v2/products";
  interval = 3600000; // default is 1 hour
  productIds = [];

  constructor(grToken, interval) {
    this.grToken = grToken;
    this.interval = interval;
  }

  start() {
    const url = this.url + "?access_token=" + this.grToken;
    this.intervalId = setInterval(this.ckProducts, this.interval, url, this);
  }

  end() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  getCurrentProducts() {
    return JSON.parse(fh.readFileSync("productIds")); // TODO: add error handling
  }

  updateCurrentProducts() {
    fh.writeFileSync("productIds", JSON.stringify(this.productIds));
  }

  ckProducts(url, self) {
    // turn 'this' into 'self' so we can access the instance
    let pIds = []; // temp list of product ids
    let newProducts = [];
    self.productIds = self.getCurrentProducts();

    const req = https.request(url, (res) => {
      let data = "";

      // as data comes in, concat the chunks data together
      res.on("data", (chunk) => {
        data += chunk.toString();
      });

      // when all the data has been received parse it and make an array of product ids
      res.on("end", () => {
        const body = JSON.parse(data);
        let updated = false;

        if (body.success) {
          for (const product of body.products) {
            pIds.push(product.id);

            if (self.productIds.indexOf(product.id) < 0) {
              //console.log(product.id + " is new.");
              updated = true;
              newProducts.push(product);
            }
          }

          if (updated) {
            self.productIds = pIds;
            self.updateCurrentProducts();
            self.cb(newProducts);
          }
        }
      });
    });
    req.on("error", (error) => {
      console.log("There was an error: ", error);
    });
    req.end();
  }

  onNewProduct(fn) {
    this.cb = fn;
  }
}

module.exports = GrListener;
