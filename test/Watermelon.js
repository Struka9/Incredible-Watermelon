const Watermelon = artifacts.require("Watermelon");

contract("Watermelon test", async (accounts) => {

    it("Should not allow other user than owner to modify post creation fee", async () => {
        let instance = await Watermelon.deployed();

        try {
            await instance.setPostCreationFee(web3.utils.toBN(1), { from: accounts[1] });
            assert.fail("Should not allow other user to modify post creation fee");
        } catch (e) {
            
        }
    });

    it("Should not allow other user than owner to modify voting fee", async () => {
        let instance = await Watermelon.deployed();

        try {
            await instance.setVoteFee(web3.utils.toBN(1));
            assert.fail("Should not allow other user to modify voting fee");
        } catch (e) {

        }
    });

    it("Should not allow other user than owner to modify posts TTL", async () => {
        let instance = await Watermelon.deployed();

        try {
            await instance.setMaxPostTTL(web3.utils.toBN(1));
            assert.fail("Should not allow other user to modify voting fee");
        } catch (e) {

        }
    });

    //string memory _title, string memory _option1Name, string memory _image1Hash, string memory _option2Name, string memory _image2Hash
    it("Should not allow empty title when adding post", async () => {
        let instance = await Watermelon.deployed();

        try {
            const value = web3.utils.toWei("0.01", "ether");
            let post = await instance.addPost("", "", "", "", "", { value });
            fail("It should not allow a post with no title");
        } catch (e) {
            assert.equal(e.reason, "Must include a title")
        }
    });

    it("Should not allow empty option 1 name when adding post", async () => {
        let instance = await Watermelon.deployed();

        try {
            const value = web3.utils.toWei("0.01", "ether");
            let post = await instance.addPost("What is better?", "", "", "", "", { value });
            fail("It should not allow a post with name for options");
        } catch (e) {
            assert.equal(e.reason, "Must include an name for option 1")
        }
    });

    it("Should not allow empty option 2 name when adding post", async () => {
        let instance = await Watermelon.deployed();

        try {
            const value = web3.utils.toWei("0.01", "ether");
            let post = await instance.addPost("What is better?", "Coffee", "", "", "", { value });
            fail("It should not allow a post with name for options");
        } catch (e) {
            assert.equal(e.reason, "Must include an name for option 2")
        }
    });

    it("Should not allow empty option 2 name when adding post", async () => {
        let instance = await Watermelon.deployed();

        try {
            const value = web3.utils.toWei("0.01", "ether");
            let post = await instance.addPost("What is better?", "Coffee", "", "Tea", "", { value });
            fail("It should not allow a post with name for options");
        } catch (e) {
            assert.equal(e.reason, "Must include an hash identifier for option 1 image")
        }
    });

    it("Should not allow empty hash for image 1 when adding post", async () => {
        let instance = await Watermelon.deployed();

        try {
            const value = web3.utils.toWei("0.01", "ether");
            let post = await instance.addPost("What is better?", "Coffee", "", "Tea", "", { value });
            fail("It should not allow a post with name for options");
        } catch (e) {
            assert.equal(e.reason, "Must include an hash identifier for option 1 image")
        }
    });

    it("Should not allow empty hash for image 2 when adding post", async () => {
        let instance = await Watermelon.deployed();

        try {
            const value = web3.utils.toWei("0.01", "ether");
            let post = await instance.addPost("What is better?", "Coffee", "adf2321", "Tea", "", { value });
            fail("It should not allow a post with name for options");
        } catch (e) {
            assert.equal(e.reason, "Must include an hash identifier for option 2 image")
        }
    });

    it("Should add a post", async () => {
        let instance = await Watermelon.deployed();
        const value = web3.utils.toWei("0.01", "ether");
        let tx = await instance.addPost("What is better?", "Coffee", "adf2321", "Tea", "adf2321", { value });
        let postsLength = await instance.getPostLength();
        assert.equal(postsLength.toString(10), "1");
    });
});