const { test } = require('node:test');
const assert = require('node:assert/strict');
const faq = require('../app/care/care-faq-data.json');

for (const locale of ['en', 'sv', 'ar']) {
  test(`${locale}: seven complete FAQ entries with matching answer structure`, () => {
    assert.equal(faq[locale].questions.length, 7);
    assert.ok(faq[locale].title && faq[locale].subtitle);
    faq[locale].questions.forEach((item, index) => {
      assert.ok(item.question);
      assert.equal(item.answers.length, faq.en.questions[index].answers.length);
      for (const block of item.answers) {
        for (const value of Object.values(block)) {
          if (Array.isArray(value)) assert.ok(value.every(text => typeof text === 'string' && text.trim()));
          else assert.ok(typeof value === 'string' && value.trim());
        }
      }
    });
    assert.equal(faq[locale].questions[2].answers[1].items.length, 5);
    assert.match(faq[locale].questions[2].answers[2].text, /30/);
    assert.match(faq[locale].questions[2].answers[3].text, /60/);
    assert.match(faq[locale].questions[1].answers[2].text, /12/);
    assert.match(faq[locale].questions[1].answers[2].text, /10/);
    assert.ok(faq[locale].questions[6].answers[0].link);
  });
}

test('English copy preserves cancellation rights and the requested limitations', () => {
  assert.equal(faq.en.title, 'Frequently Asked Questions');
  assert.equal(faq.en.subtitle, 'Everything you need to know about BlueMind Care.');
  assert.equal(faq.en.questions[1].answers[3].text, 'Cancellation does not automatically provide a refund for unused time. Any applicable statutory cancellation or refund rights remain unaffected.');
  assert.equal(faq.en.questions[2].answers[4].text, 'Unused monthly update time does not carry over to the following month.');
  assert.equal(faq.en.questions[5].answers[2].text, 'We will not make additional charges without the required authorization.');
});
