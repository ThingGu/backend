const express = require('express');

const admin = require('firebase-admin');

const router = express.Router();

router.post('/:id', (req, res, next) => {
    const uid = req.params.id;
    const { recipient, reason } = req.body;

    admin.firestore().collection('Report').add({
        reporter: uid,
        recipient: recipient,
        reason: reason,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
        console.log('신고 성공');

        res.send({
            status: 200,
            message: '사용자 신고 성공',
        });
    })
    .catch((error) => {
        console.error(error);

        res.send({
            status: 400,
            message: error,
        });
    });
});

router.get('/:id', (req, res, next) => {
    const uid = req.params.id;

    admin.firestore().collection('Report').where('recipient', '==', uid).get()
    .then((docs) => {
        let data = [];
        
        docs.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            data.push(doc.data());
        });

        res.send({
            status: 200,
            data: data
        });
    })
    .catch((error) => {
        console.error(error);

        res.send({
            status: 400,
            message: error,
        })
    });
});

module.exports = router;
