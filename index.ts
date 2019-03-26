import { Logger } from '@log4js-node/log4js-api';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { BotProxy } from './bot-proxy.interface';
import { MessageContext } from './message-context.interface';

let mBot: BotProxy;
let logger: Logger;
let metadata: { [key: string]: string };

let infoText: string;
let periodicGuideText: string;

export const init = async (bot: BotProxy, options: { [key: string]: any }): Promise<void> => {
    mBot = bot;
    logger = options.logger || console;
    metadata = await import(path.resolve(__dirname, 'package.json'));

    try {
        infoText = (await promisify(fs.readFile)(path.resolve(__dirname, 'text', 'info.txt'), {encoding: 'utf-8'})).trim();
        periodicGuideText = (await promisify(fs.readFile)(path.resolve(__dirname, 'text', 'periodic-guide.txt'),
            {encoding: 'utf-8'})).trim();
    } catch (e) {
        logger.warn('Could not load guide text.');
        throw e;
    }

    logger.info(`${metadata.name} plugin v${metadata.version} has been initialized.`);
};

export const onStart = () => {
    logger.debug('onStart()');
};

export const onStop = () => {
    logger.debug('onStop()');
};

export const onMessage = async (message: string, context: MessageContext, data: { [key: string]: any }) => {
    await mBot.sendTalk(context.channelId, infoText);
};

export const onPluginEvent = async (eventName: string, value?: any, fromId?: string) => {
    if (eventName === 'scheduled:periodic-guide') {
        await mBot.sendTalk(await mBot.getChannelId(process.env.REC0_ENV_PERIODIC_GUIDE_CHANNEL || 'random'), periodicGuideText);
    }
};
