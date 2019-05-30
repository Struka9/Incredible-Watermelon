pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Watermelon is Ownable {

    using SafeMath for uint256;

    event PostCreated(uint256 _id, string _title);
    event VoteSubmitted(uint256 _postId);
    event Withdraw(uint256 _postId);

    struct Post {
        address owner;
        string title;
        string image1Hash;
        string image2Hash;
        string option1Name;
        string option2Name;

        uint dueDate;
        mapping(address => uint8) _votes;
        mapping(address => bool) _usedAddress;

        uint votesOption1;
        uint votesOption2;
    }

    // The amount of posts returned on each request to getPostsPage()
    uint constant _postsPerPage = 10;

    Post[] private _posts;
    
    uint private _postCreationFee = 0.0001 ether;
    uint private _voteFee = 0.0001 ether;
    uint32 private _maxPostTTL = 1 weeks;
    
    function setPostCreationFee(uint8 _fee) external onlyOwner {
        _postCreationFee = _fee;
    }

    function setVoteFee(uint8 _fee) external onlyOwner {
        _voteFee = _fee;
    }

    function setMaxPostTTL(uint32 ttl) external onlyOwner {
        _maxPostTTL = ttl;
    }

    function addPost(string memory _title, string memory _option1Name, string memory _image1Hash, string memory _option2Name, string memory _image2Hash) public payable returns(uint) {
        require(msg.value >= _postCreationFee, "Not enough to create post");
        require(bytes(_title).length > 0, "Must include a title");
        require(bytes(_option1Name).length > 0, "Must include an name for option 1");
        require(bytes(_option2Name).length > 0, "Must include an name for option 2");
        require(bytes(_image1Hash).length > 0, "Must include an hash identifier for option 1 image");
        require(bytes(_image2Hash).length > 0, "Must include an hash identifier for option 2 image");

        address postOwner = msg.sender;
        Post memory post = Post({
            owner: postOwner,
            title: _title,
            image1Hash: _image1Hash,
            image2Hash: _image2Hash,
            option1Name: _option1Name,
            option2Name: _option2Name,
            dueDate: now + _maxPostTTL,
            votesOption1: 0,
            votesOption2: 0
        });
        uint id = _posts.push(post);
        emit PostCreated(id, _title);
        return id;
    }

    function getPostLength() view public returns(uint) {
        return _posts.length;
    }

    function getPostForId(uint _id) view public returns(
        uint,
        address,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory, 
        uint,
        uint,
        uint) {

        require(_id >= 0 && _id < _posts.length);
        Post memory post = _posts[_id];
        return (_id, post.owner, post.title, post.option1Name, post.image1Hash, post.option2Name, post.image2Hash, post.dueDate, post.votesOption1, post.votesOption2);
    }

    function getPostPage(uint _page) view public returns(
        uint,
        uint[] memory,
        string[] memory,
        string[] memory,
        string[] memory) {

        if (_page.mul(_postsPerPage) >= _posts.length) {
            // We know that with the given page we will not be able to retrieve a single Post
            return (
                0,
                new uint[](0),
                new string[](0),
                new string[](0),
                new string[](0));
        }
    
        // 1-based calculations
        uint index = _posts.length - _page.mul(_postsPerPage);
        
        uint size = index;
        if (index >= _postsPerPage) {
            size = _postsPerPage;
        }
        
        uint[] memory ids = new uint[](size);
        string[] memory titles = new string[](size);
        string[] memory option1Hashes = new string[](size);
        string[] memory option2Hashes = new string[](size);

        uint counter = 0;
        for (uint counter = 0; counter < size; counter++) {
            index = index.sub(1);
            Post memory post = _posts[index];
            ids[counter] = index;
            titles[counter] = post.title;
            option1Hashes[counter] = post.image1Hash;
            option2Hashes[counter] = post.image2Hash;
        }
        return (size, ids, titles, option1Hashes, option2Hashes);
    }

    function voteOnPost(uint _postId, uint8 _vote) public payable {
        require(msg.value >= _voteFee, "Not enough to pay fee");
        require(_postId < _posts.length, "Invalid post id");
        require(_vote >= 0 && _vote <= 1, "Invalid vote option");

        Post storage post = _posts[_postId];
        require(post._usedAddress[msg.sender] == false, "Cannot vote twice");
        
        if (_vote == 0) {
            post.votesOption1++;
        } else if (_vote == 1) {
            post.votesOption2++;
        }
        post._votes[msg.sender] = _vote;
        post._usedAddress[msg.sender] = true;

        emit VoteSubmitted(_postId);
    }
}