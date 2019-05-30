const Watermelon = artifacts.require("Watermelon");

const chai = require('chai');
const BN = require('bn.js');
const bnChai = require('bn-chai');
chai.use(bnChai(BN));

contract("Watermelon test", async (accounts) => {

    let instance;

    beforeEach(async function () {
        instance = await Watermelon.new(accounts[0]);
    });

    async function addPosts(amount, contractInstance) {
        for (i = 0;
            i < amount;
            i++) {
            const value = web3.utils.toWei("0.01", "ether");
            let tx = await contractInstance.addPost("What is better?", "Coffee", "adf2321", "Tea", "adf2321", { value });
        }
    }

    it("Should return empty posts when requesting a page that 'does not exist'", async () => {
        // Let's fetch a page with an empty array of posts
        const page = await instance.getPostPage.call(web3.utils.toBN(1), { from: accounts[0], gasLimit: web3.utils.toBN(41000) });
        // The first value indicates the amount of data actually returned
        assert.equal(page[0], 0);
    });

    it("Should return a page with posts", async () => {
        // Let's fetch a page with an empty array of posts
        // Add some posts
        const value = web3.utils.toWei("0.01", "ether");
        let tx = await instance.addPost("What is better?", "Coffee", "adf2321", "Tea", "adf2321", { value });
        const page = await instance.getPostPage.call(web3.utils.toBN(0), { from: accounts[0] });
        // The first value indicates the amount of data actually returned
        assert.equal(page[0], 1);
        assert.equal(page[2][0], "What is better?");
    });

    it("Should not allow other user than owner to modify post creation fee", async () => {
        try {
            await instance.setPostCreationFee(web3.utils.toBN(1), { from: accounts[1] });
            assert.fail("Should not allow other user to modify post creation fee");
        } catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert");
        }
    });

    it("Should not allow other user than owner to modify voting fee", async () => {
        try {
            await instance.setVoteFee(web3.utils.toBN(1), { from: accounts[1] });
            assert.fail("Should not allow other user to modify voting fee");
        } catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert");
        }
    });

    it("Should not allow other user than owner to modify posts TTL", async () => {
        try {
            await instance.setMaxPostTTL(web3.utils.toBN(1), { from: accounts[1] });
            assert.fail("Should not allow other user to modify voting fee");
        } catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert");
        }
    });

    it("Should not allow create a post if no ether is sent", async () => {
        try {
            const value = web3.utils.toWei("0", "ether");
            let post = await instance.addPost("", "", "", "", "", { value });
            assert.fail("It should not allow a post with no title");
        } catch (e) {
            assert.equal(e.reason, "Not enough to create post")
        }
    });

    it("Should not allow empty title when adding post", async () => {


        try {
            const value = web3.utils.toWei("0.01", "ether");
            let post = await instance.addPost("", "", "", "", "", { value });
            assert.fail("It should not allow a post with no title");
        } catch (e) {
            assert.equal(e.reason, "Must include a title")
        }
    });

    it("Should not allow empty option 1 name when adding post", async () => {


        try {
            const value = web3.utils.toWei("0.01", "ether");
            let post = await instance.addPost("What is better?", "", "", "", "", { value });
            assert.fail("It should not allow a post with name for options");
        } catch (e) {
            assert.equal(e.reason, "Must include an name for option 1")
        }
    });

    it("Should not allow empty option 2 name when adding post", async () => {


        try {
            const value = web3.utils.toWei("0.01", "ether");
            let post = await instance.addPost("What is better?", "Coffee", "", "", "", { value });
            assert.fail("It should not allow a post with name for options");
        } catch (e) {
            assert.equal(e.reason, "Must include an name for option 2")
        }
    });

    it("Should not allow empty option 2 name when adding post", async () => {


        try {
            const value = web3.utils.toWei("0.01", "ether");
            let post = await instance.addPost("What is better?", "Coffee", "", "Tea", "", { value });
            assert.fail("It should not allow a post with name for options");
        } catch (e) {
            assert.equal(e.reason, "Must include an hash identifier for option 1 image")
        }
    });

    it("Should not allow empty hash for image 1 when adding post", async () => {


        try {
            const value = web3.utils.toWei("0.01", "ether");
            let post = await instance.addPost("What is better?", "Coffee", "", "Tea", "", { value });
            assert.fail("It should not allow a post with name for options");
        } catch (e) {
            assert.equal(e.reason, "Must include an hash identifier for option 1 image")
        }
    });

    it("Should not allow empty hash for image 2 when adding post", async () => {


        try {
            const value = web3.utils.toWei("0.01", "ether");
            let post = await instance.addPost("What is better?", "Coffee", "adf2321", "Tea", "", { value });
            assert.fail("It should not allow a post with name for options");
        } catch (e) {
            assert.equal(e.reason, "Must include an hash identifier for option 2 image")
        }
    });

    it("Should add a post", async () => {

        const lengthBefore = await instance.getPostLength();
        const value = web3.utils.toWei("0.01", "ether");
        let tx = await instance.addPost("What is better?", "Coffee", "adf2321", "Tea", "adf2321", { value });
        const lengthAfter = await instance.getPostLength();
        // expect(lengthAfter).to.eq.BN(lengthBefore.add(web3.utils.toBN(1)));
        assert.equal(tx.logs[0].event, "PostCreated");
    });

    it("Should not allow to vote on a post if not enough ether is sent", async () => {

        const value = web3.utils.toWei("0", "ether");

        try {
            const tx = await instance.voteOnPost(0, 1);
            assert.fail("Should not allow to vote if not enough ether is sent");
        } catch (e) {
            assert.equal(e.reason, "Not enough to pay fee");
        }
    });

    it("Should not allow to vote on a post with an unexistent id", async () => {

        const value = web3.utils.toWei("0.05", "ether");

        try {
            const tx = await instance.voteOnPost(-1, 1, { value });
            assert.fail();
        } catch (e) {
            assert.equal(e.reason, "Invalid post id");
        }
    });

    it("Should not allow to vote on a post with a vote option other than 0 or 1", async () => {
        const value = web3.utils.toWei("0.05", "ether");

        try {
            await instance.addPost("What is better?", "Coffee", "adf2321", "Tea", "adf2321", { value });
            await instance.voteOnPost(0, 2, { value });
            assert.fail();
        } catch (e) {
            assert.equal(e.reason, "Invalid vote option");
        }
    });

    it("Should not allow to vote on a post twice", async () => {
        const value = web3.utils.toWei("0.05", "ether");
        await instance.addPost("What is better?", "Coffee", "adf2321", "Tea", "adf2321", { value });
        await instance.voteOnPost(0, 1, { value });
        try {
            await instance.voteOnPost(0, 1, { value });
            assert.fail();
        } catch (e) {
            assert.equal(e.reason, "Cannot vote twice");
        }
    });

    it("Should increase the amount of votes by one", async () => {
        const value = web3.utils.toWei("0.05", "ether");
        await instance.addPost("What is better?", "Coffee", "adf2321", "Tea", "adf2321", { value });
        const postBefore = await instance.getPostForId(0);
        const tx = await instance.voteOnPost(0, 1, { value });
        const postAfter = await instance.getPostForId(0);

        assert.equal(postBefore[9].add(new BN(1)).toString(), postAfter[9].toString());
    });
});