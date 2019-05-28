const Watermelon = artifacts.require("Watermelon");

module.exports = function (deployer) {
  return deployer.deploy(Watermelon)
    .then((instance) =>
      console.log("Success Deploying contract at: " + instance.address))
    .catch(e => {
      console.log(e)
    });
};
