const kafka = require('kafka-node');
//const { io } = require('./app');

const client = new kafka.KafkaClient({
    kafkaHost: process.env.KAFKA_BROKER_URL,
    sasl: {
        mechanism: 'scram-sha-256',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD
    },
    ssl: true
});

const producer = new kafka.Producer(client);

producer.on('ready', () => {
    console.log('kafka producer is ready');
});

producer.on('error', (err) => {
    console.error('error in kafka producer:', err);
});

function publishToKafka(topic, message) {
    const payloads = [
        { topic: topic, messages: JSON.stringify(message), partition: 0 }
    ];
    producer.send(payloads, (err, data) => {
        if (err) console.error('error sending to kafka:', err);
        else console.log('message sent to kafka:', data);
    });
}

const consumer = new kafka.Consumer(
    client,
    [{ topic: 'notifications', partition: 0 }],
    { autoCommit: true }
);

consumer.on('message', (message) => {
    console.log('received message from kafka:', JSON.parse(message.value));

    //io.emit('notification', JSON.parse(message.value));
});

consumer.on('error', (err) => {
    console.error('error in kafka consumer:', err);
});

module.exports = { publishToKafka };