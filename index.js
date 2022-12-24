const Splitwise = require('splitwise')
const puppeteer = require('puppeteer');

const sw = Splitwise({
  consumerKey: '',
  consumerSecret: ''
})

// sw.getCurrentUser().then(console.log)
userId = "25383555";
dated_after = "2022-12-21";
dated_before = "2022-12-22"
webpage_url = "http://192.168.20.126:8888/";

async function getExpenses() {
    let expenses = await sw.getExpenses({
        dated_after: dated_after,
        dated_before: dated_before
    });
    let mmExpenses = [];
    // console.log(expenses);
    for(expense of expenses) {
        // if(expense['description'] == "Dinner (Mahi)")
        //     console.log(expense);
        let mmExpense = {};
        mmExpense['Contents'] = expense['description'];
        mmExpense['Amount'] = 0;
        mmExpense['date'] = expense['created_at'].substring(0, 10);
        mmExpense['category'] = expense['category']['name'];
        // mmExpense['created_by'] = expense['created_by']['first_name'];
        mmExpense['details'] = "Using Splitwise API. Expense id: "+ expense['id'] +". Created By: " + 
                                expense['created_by']['first_name'];

        // TODO Use users instead of repayments to calculate expenses
        for(repayment of expense['repayments']) {
            // Calculate total amount owed/spent
            if(repayment['from'] == userId) {
                mmExpense['Amount']+=parseInt(repayment['amount']);
            }
        }
        if(mmExpense['Amount']>0)
            mmExpenses.push(mmExpense);

    }
    return mmExpenses;
}

async function openWebpage() {
    const browser = await puppeteer.launch({headless:false});
	const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 })

	await page.goto(webpage_url);
    // Wait till the table is fully loaded
    await page.waitForSelector('.x-grid3-row');

    // Click on add expense button
    await page.click('#ext-gen149');
    return page;
}


async function addExpenes(page, expenses) {
    await page.waitForSelector('#ext-comp-1022');
    // await page.type('ext-comp-1022', '2022-12-23');
    // for (expense of expenses) {
        let expense = expenses[0];
        // console.log(expenses);

        // Clear input boxes
        // let input = await page.$('#ext-comp-1022');
        // await input.click({ clickCount: 3 })
        // await input.type(expense['date']);   
        async function insertData(id, value) {
            console.log(value, id);
            // await page.evaluate((id, value) => {
            //     const element = document.getElementById(id);
            //     element.value = value;
            // }, id, value);
            // Clear existing values if any
            // await input.click({ clickCount: 3 }) 
            await page.waitForSelector("#"+id);
            await page.focus("#"+id);
            await page.keyboard.type(value);

            // const input = await page.$("#"+id);
            // await input.click({ clickCount: 3 })
            // await input.type(value);
        }
        // await page.evaluate((expense) => {
        //     const example = document.getElementById('ext-comp-1022');
        //     example.value = expense['date'];
        //     console.log(example);
        // }, expense);

        // clear date
        // const input = await page.$("#ext-comp-1022");
        // await input.click({ clickCount: 3 })
        // await input.type("");
        // Clear date field
        await page.focus("#ext-comp-1022");
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Backspace');
          }
        await insertData('ext-comp-1022', expense['date']);
        await insertData('ext-comp-1023', expense['Contents']);
        await insertData('ext-comp-1024', expense['Amount'].toString());
        await insertData('ext-comp-1006', "SBI");
        await page.waitForSelector('.x-combo-list-item.x-combo-selected');
        await page.evaluate(() => document.getElementsByClassName('x-combo-list-item x-combo-selected')[0].click())
        await insertData('ext-comp-1007', 'Food & Dining');
        // await page.waitForSelector('.x-combo-list-item.x-combo-selected');
        // await page.waitForFunction("document.getElementsByClassName('x-combo-list-item x-combo-selected') && document.getElementsByClassName('x-combo-list-item x-combo-selected')[1].innerHTML == 'Food & Dining'")
        // await page.evaluate(() => document.getElementsByClassName('x-combo-list-item x-combo-selected')[1].click())
        // await insertData('ext-comp-1026', expense['details']);
        // await page.click('#ext-gen176');
        // let button = await page.$$("#ext-gen176");
        // await button.evaluate(b => b.click());

        // await page.evaluate(()=>document.querySelector('#ext-gen176').click())
    // }
}

async function main() {
    let expenses = await getExpenses();
    const page = await openWebpage();
    await addExpenes(page, expenses);
}
     
main();

