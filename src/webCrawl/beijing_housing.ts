import {chromium, ConsoleMessage } from 'playwright'
import https from 'https'
import {createWriteStream, PathLike} from "fs";
import {DateTime} from "luxon";

const listULClassName = '.tzghgsul';
const nextPageClassName = '.layui-laypage-next';
const timeout = 5000;
type Attachment = {
    url: string,
    name: string,
}
type Item = {
    type: string,
    title: string,
    id: string,
    date: string,
    details: string,
    attachments: Attachment[],
}
const baseUrl = 'https://yewu.ghzrzyw.beijing.gov.cn';
const maniPageUrl = 'https://yewu.ghzrzyw.beijing.gov.cn/gwxxfb/cxghghlgs/ghlgs.html';
const detailsPageUrl = 'https://yewu.ghzrzyw.beijing.gov.cn/gwxxfb/cxghghlgs/ghlgsxq.html';
const consolePage = (prefix: string ) => {
    return (msg: ConsoleMessage) => {
        console.log(`${prefix}: type: ${msg.type()} msg: ${msg.text()}`)
    }
};
const downloadFile = (url: string, fileName: PathLike): Promise<void> => {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            const file = createWriteStream(fileName, {flags: 'w+'});
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
            file.on('error', reject);
            res.on('error', reject)
        });
    })
};
const downloadFiles = (item: Item) => {
    let index = 0;
    return new Promise<void>(resolve => {
        const helper = () => {
            if(index < item.attachments.length ){
                console.log(`Downloading ${index + 1}/${item.attachments.length}`);
                downloadFile(`${baseUrl}${item.attachments[index].url}`, `${item.id}_${item.attachments[index].name}`).finally(() => {
                    index++;
                    setTimeout(() => helper(), timeout);
                })
            } else {
                resolve()
            }
        };
        helper()
    })
};
(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const mainPage = await context.newPage();
    mainPage.on('console', consolePage('Main page'));
    const detailsPage = await context.newPage();
    // detailsPage.on('console', consolePage('Details page'));

    await mainPage.goto(maniPageUrl);
    const parseDetails = async (items: Item[]) => {
        return new Promise<void>((resolve) => {
            let index = 0;
            const helper = async () => {
                console.log(`Parsing detail ${index +1}/${items.length}`);
                if(index < items.length) {
                    let item = items[index];
                    if (item.id) {
                        console.log(`Id: ${item.id}`);
                        console.log('Waiting for new page');
                        await detailsPage.goto(`${detailsPageUrl}?id=${items[0].id}`);
                        const mainText = detailsPage.locator('#mainText');
                        await mainText.waitFor();
                        await mainText.allInnerTexts().then(data => {
                            item.details = data.join('\n');
                        });
                        item = await mainText.evaluateAll<Item, Item>((r, details: Item) => {
                            const attachments = r[0].querySelectorAll('#mainText a');
                            attachments.forEach(a => {
                                details.attachments.push({
                                    url: a.getAttribute('href') || "",
                                    name: a.getAttribute('title') || "",
                                });
                            });
                            return details;
                        }, item);
                        if (item.attachments.length > 0) {
                            console.log(`attachment url: ${item.attachments[index].url}`);
                            await downloadFiles(item)
                        }
                    }
                    index++;
                    setTimeout(() => helper(), timeout)
                } else {
                    resolve();
                }
            };
            helper();
        });

    };

    const parseMainPage = async () => {
        const ul = mainPage.locator(listULClassName);
        await ul.waitFor({timeout: timeout});
        console.log(`Parsing main page`);
        const tmp: Item[] = await ul.evaluateAll<Item[]>((ul) => {
            const lis = Array.from(ul[0].querySelectorAll('li'));
            return lis.map(li => {
                const type = li.firstElementChild?.textContent || "";
                const date = li.lastElementChild?.textContent || "";
                const title = li.querySelector('div')?.getAttribute('title') || "";
                const id  = (li.querySelector('a')?.getAttribute('href') || "").replace(`javascript:openForm('`, '').slice(0,-2);
                return {
                    type, date, title, id, details: '', attachments: [],
                }
            })
        });
        const items: Item[] = [];
        const now = DateTime.utc();
        let shouldClickNext = true;
        tmp.forEach( i => {
            const d = DateTime.fromFormat(i.date, 'yyyy-MM-dd');
            if(d.isValid){
                if(d.toUnixInteger() >= now.toUnixInteger()){
                    items.push(i);
                } else {
                    shouldClickNext = false
                }
            }
        });
        await parseDetails(items);
        if(shouldClickNext){
            console.log(`Finding next button`);
            const orderSent = mainPage.locator(nextPageClassName);
            await orderSent.waitFor();
            if(orderSent){
                console.log(`next button found, clicking`);
                await orderSent.click();
                setTimeout(async () => {
                    console.log('Click requests completed');
                    await parseMainPage();
                }, timeout)
            }
        } else {
            await detailsPage.close();
            await browser.close();
        }
    };
    await parseMainPage();
})();