/*const kafka = require('kafka-node');
const { sendNotification } = require('./socket');

const client = new kafka.KafkaClient({
    kafkaHost: process.env.KAFKA_BROKER_URL,
    connectTimeout: 60000,
    requestTimeout: 60000,
    sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD
    },
    ssl: true,
    sslOptions: {
        rejectUnauthorized: false
    }
});

const producer = new kafka.Producer(client, {
    requireAcks: 1,
    ackTimeoutMs: 1000,
    partitionerType: 2,
    retry: {
        retries: 5
    }
});

let producerReady = false;
let producerInitPromise = null;
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

function initializeProducer() {
    if (producerInitPromise) {
        return producerInitPromise;
    }

    producerInitPromise = new Promise((resolve, reject) => {
        const attemptInitialization = () => {
            initializationAttempts++;
            console.log(`attempting to initialize kafka producer (attempt ${initializationAttempts}/${MAX_INIT_ATTEMPTS})`);

            producer.on('ready', () => {
                console.log('kafka producer is ready');
                producerReady = true;
                resolve();
            });

            producer.on('error', (err) => {
                console.error('error in kafka producer:', err.message);
                if (!producerReady && initializationAttempts < MAX_INIT_ATTEMPTS) {
                    console.log('retrying producer initialization...');
                    setTimeout(attemptInitialization, 5000);
                } else if (!producerReady) {
                    console.error(`failed to initialize producer after ${MAX_INIT_ATTEMPTS} attempts`);
                    reject(err);
                }
            });
        };

        attemptInitialization();
    });

    return producerInitPromise;
}

async function publishToKafka(topic, message) {
    try {
        if (!producerReady) {
            // If not ready, try to initialize again
            try {
                await initializeProducer();
            } catch (initError) {
                console.warn('Kafka producer not available, storing message without publishing');
                return; // Continue without Kafka
            }
        }

        const messageString = typeof message === 'string' 
            ? message 
            : JSON.stringify(message);

        const payloads = [{
            topic: topic,
            messages: messageString,
            partition: 0
        }];

        return new Promise((resolve, reject) => {
            producer.send(payloads, (err, data) => {
                if (err) {
                    console.error('error sending to kafka:', err.message);
                    reject(new Error(err.message));
                } else {
                    console.log('message sent to kafka:', data);
                    resolve(data);
                }
            });
        });
    } catch (error) {
        console.error('error in publishToKafka:', error.message);
        throw error;
    }
}

const topics = [{
    topic: 'notifications',
    partition: 0
}];

const consumerOptions = {
    autoCommit: true,
    fetchMaxWaitMs: 1000,
    fetchMaxBytes: 1024 * 1024,
    encoding: 'utf8',
    fromOffset: 'latest'
};

const consumer = new kafka.Consumer(client, topics, consumerOptions);

consumer.on('message', async (message) => {
    try {
        console.log('received raw kafka message:', message);
        
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message.value);
        } catch (parseError) {
            console.error('failed to parse message:', parseError.message);
            return;
        }

        console.log('received message from kafka:', parsedMessage);
        await sendNotification(parsedMessage);
    } catch (error) {
        console.error('error processing kafka message:', error.message);
    }
});

consumer.on('error', (err) => {
    console.error('error in kafka consumer:', err.message);
});

const shutdown = async () => {
    try {
        await new Promise(resolve => consumer.close(true, resolve));
        console.log('consumer closed');
        
        await new Promise(resolve => producer.close(resolve));
        console.log('producer closed');
        
        process.exit(0);
    } catch (error) {
        console.error('error during shutdown:', error.message);
        process.exit(1);
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

initializeProducer().catch(err => {
    console.error('failed to initialize Kafka producer:', err.message);
});

module.exports = { publishToKafka };*/


const kafka = require('kafka-node');
const { sendNotification } = require('./socket');

const client = new kafka.KafkaClient({
    kafkaHost: process.env.KAFKA_BROKER_URL,
    connectTimeout: 30000,
    requestTimeout: 30000,
    sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD
    },
    ssl: true,
    sslOptions: {
        rejectUnauthorized: false
    }
});

const producer = new kafka.Producer(client, {
    requireAcks: 1,
    ackTimeoutMs: 100,
    partitionerType: 2
});

let producerReady = false;

producer.on('ready', () => {
    console.log('kafka producer is ready');
    producerReady = true;
});

producer.on('error', (err) => {
    console.error('error in kafka producer:', err.message);
});

async function publishToKafka(topic, message) {
    try {
        if (!producerReady) {
            throw new Error('kafka producer is not ready');
        }

        const messageString = typeof message === 'string' 
            ? message 
            : JSON.stringify(message);

        const payloads = [{
            topic: topic,
            messages: messageString,
            partition: 0
        }];

        return new Promise((resolve, reject) => {
            producer.send(payloads, (err, data) => {
                if (err) {
                    console.error('error sending to kafka:', err.message);
                    reject(new Error(err.message));
                } else {
                    console.log('message sent to kafka:', data);
                    resolve(data);
                }
            });
        });
    } catch (error) {
        console.error('Error in publishToKafka:', error.message);
        throw new Error(error.message);
    }
}

const topics = [{
    topic: 'notifications',
    partition: 0
}];

const consumerOptions = {
    autoCommit: true,
    fetchMaxWaitMs: 1000,
    fetchMaxBytes: 1024 * 1024,
    encoding: 'utf8'
};

const consumer = new kafka.Consumer(client, topics, consumerOptions);

consumer.on('message', async (message) => {
    try {
        console.log('received raw kafka message:', message);
        
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message.value);
        } catch (parseError) {
            console.error('failed to parse message:', parseError.message);
            return;
        }

        console.log('received message from kafka:', parsedMessage);
        await sendNotification(parsedMessage);
    } catch (error) {
        console.error('error processing kafka message:', error.message);
    }
});

consumer.on('error', (err) => {
    console.error('error in kafka consumer:', err.message);
});

const shutdown = async () => {
    try {
        await new Promise(resolve => consumer.close(true, resolve));
        console.log('consumer closed');
        
        await new Promise(resolve => producer.close(resolve));
        console.log('producer closed');
        
        process.exit(0);
    } catch (error) {
        console.error('error during shutdown:', error.message);
        process.exit(1);
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = { publishToKafka };