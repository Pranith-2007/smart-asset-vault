
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SmartAssetVault {
    struct Document {
        address owner;
        bytes32 contentHash;
        bool exists;
    }

    struct Share {
        address grantedBy;
        bool active;
    }

    mapping(bytes32 => Document) public documents;
    mapping(bytes32 => mapping(address => Share)) public shares;

    event DocumentRegistered(
        bytes32 indexed documentId,
        address indexed owner,
        bytes32 contentHash
    );

    event ShareUpdated(
        bytes32 indexed documentId,
        address indexed recipient,
        address indexed owner,
        bool active
    );

    error InvalidDocumentId();
    error InvalidContentHash();
    error DocumentAlreadyRegistered();
    error DocumentNotFound();
    error NotDocumentOwner();
    error InvalidRecipient();
    error OwnerCannotShareWithSelf();

    function registerDocument(
        bytes32 documentId,
        bytes32 contentHash
    ) external {
        if (documentId == bytes32(0)) revert InvalidDocumentId();
        if (contentHash == bytes32(0)) revert InvalidContentHash();
        if (documents[documentId].exists) {
            revert DocumentAlreadyRegistered();
        }

        documents[documentId] = Document({
            owner: msg.sender,
            contentHash: contentHash,
            exists: true
        });

        emit DocumentRegistered(documentId, msg.sender, contentHash);
    }

    function verifyDocument(
        bytes32 documentId,
        bytes32 contentHash
    ) external view returns (bool) {
        Document storage doc = documents[documentId];

        return doc.exists && doc.contentHash == contentHash;
    }

    function setShare(
        bytes32 documentId,
        address recipient,
        bool active
    ) external {
        Document storage doc = documents[documentId];

        if (!doc.exists) revert DocumentNotFound();
        if (doc.owner != msg.sender) revert NotDocumentOwner();
        if (recipient == address(0)) revert InvalidRecipient();
        if (recipient == msg.sender) revert OwnerCannotShareWithSelf();

        shares[documentId][recipient] = Share({
            grantedBy: msg.sender,
            active: active
        });

        emit ShareUpdated(documentId, recipient, msg.sender, active);
    }

    function canAccess(
        bytes32 documentId,
        address recipient
    ) external view returns (bool) {
        Document storage doc = documents[documentId];

        return doc.exists &&
            (recipient == doc.owner || shares[documentId][recipient].active);
    }

    function getDocument(
        bytes32 documentId
    ) external view returns (
        address owner,
        bytes32 contentHash,
        bool exists
    ) {
        Document storage doc = documents[documentId];
        return (doc.owner, doc.contentHash, doc.exists);
    }
}
