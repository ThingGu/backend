const express = require('express');

const admin = require('firebase-admin');

const router = express.Router();

router.post('/:id', (req, res, next) => {
    const uid = req.params.id;
    const { recipient } = req.body;

    admin.firestore().collection('Block').add({
        blocker: uid,
        recipient: recipient,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
        console.log('차단 성공');

        res.send({
            status: 200,
            message: '사용자 차단 성공',
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

    admin.firestore().collection('Block').where('blocker', '==', uid).get()
    .then((docs) => {
        let data = [];

        docs.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            data.push(Object.assign(doc.data(), { blockId: doc.id }));
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
        });
    });
});

router.delete('/:blockId', (req, res, next) => {
    const blockId = req.params.blockId;

    admin.firestore().collection('Block').doc(blockId).delete()
    .then(() => {
        console.log('차단 해제 성공');

        res.send({
                status: 200,
                message: '사용자 차단 해제 성공',
            });
    })
    .catch((error) => {
        console.log('사용자 차단 해제 실패');
        console.error(error);

        res.send({
            status: 400,
            message: error,
        });
    });
});

module.exports = router;
