"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.writeToFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
function writeToFile(filename, content) {
    const directory = path_1.default.resolve('./data');
    fs_1.default.writeFile(`${directory}/${filename}.json`, JSON.stringify(content, this, "\t"), { flag: 'w' }, err => {
        if (err) {
            console.error('Failed to write to file', err);
            return;
        }
    });
}
exports.writeToFile = writeToFile;
function sendNotification(msg = 'Crawling is finished') {
    aws_sdk_1.default.config.update({
        accessKeyId: process.env.AWS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_ID,
        region: 'us-west-2'
    });
    var params = {
        Message: msg,
        TopicArn: 'arn:aws:sns:us-west-2:327676338247:CrawlerNotification'
    };
    var publishTextPromise = new aws_sdk_1.default.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
    publishTextPromise.then((data) => {
        console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
        console.log("MessageID is " + data.MessageId);
    }).catch((err) => {
        console.error(err, err.stack);
    });
}
exports.sendNotification = sendNotification;
