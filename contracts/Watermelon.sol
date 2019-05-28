pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Watermelon is Ownable {

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
        return (post.owner, post.title, post.option1Name, post.image1Hash, post.option2Name, post.image2Hash, post.dueDate, post.votesOption1, post.votesOption2);
    }

    function voteOnPost(uint _postId, uint8 _vote) public payable {
        require(msg.value >= _voteFee);
        require(_postId < _posts.length);
        require(_vote >= 0 && _vote <= 1);

        Post storage post = _posts[_postId];
        require(post._usedAddress[msg.sender] == false);
        
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