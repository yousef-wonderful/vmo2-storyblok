// Storyblok component schemas for the O2 buying layer. seed.ts upserts these by name.
// One component per block type in ../app/src/engine/types.ts, plus the `journey_step` page type.
// Customer-facing content only: no demo, persona or agent fields.
// List fields (badges, bullets, points...) are one item per line, so editors and agents can change them as plain text.

type Field = Record<string, unknown> & { type: string };
export interface ComponentDef {
  name: string; display_name: string; folder: 'Pages' | 'Blocks' | 'Parts' | 'App';
  is_root?: boolean; is_nestable?: boolean; preview_field?: string; icon?: string; color?: string;
  schema: Record<string, Field>;
}

const text = (display_name: string, extra: Partial<Field> = {}): Field => ({ type: 'text', display_name, ...extra });
const area = (display_name: string, extra: Partial<Field> = {}): Field => ({ type: 'textarea', display_name, ...extra });
const bool = (display_name: string): Field => ({ type: 'boolean', display_name });
const image = (display_name: string): Field => ({ type: 'asset', display_name, filetypes: ['images'] });
const images = (display_name: string): Field => ({ type: 'multiasset', display_name, filetypes: ['images'] });
const option = (display_name: string, values: string[], default_value?: string): Field =>
  ({ type: 'option', display_name, options: values.map(v => ({ name: v, value: v })), default_value });
const bloks = (display_name: string, whitelist: string[], extra: Partial<Field> = {}): Field =>
  ({ type: 'bloks', display_name, restrict_components: true, component_whitelist: whitelist, ...extra });
const tab = (display_name: string, keys: string[]): Field => ({ type: 'tab', display_name, keys });
const link = (display_name: string): Field => ({ type: 'multilink', display_name, restrict_content_types: true, component_whitelist: ['journey_step'], allow_target_blank: false });
const lines = 'One per line';
const num = (display_name: string, extra: Partial<Field> = {}): Field => ({ type: 'number', display_name, ...extra });

export const APP_BLOCKS = ['app_header', 'offer_slot', 'bill_card', 'plan_card', 'usage_card', 'priority_section'];
export const BLOCKS = ['hero', 'choice', 'reco', 'splash', 'offer', 'form', 'result', 'info_card', 'order_summary', 'legal', 'note'];

export const COMPONENTS: ComponentDef[] = [
  // Parts: only used inside a block.
  { name: 'choice_option', display_name: 'Choice option', folder: 'Parts', is_nestable: true, preview_field: 'title', schema: {
    title: text('Title', { required: true }), meta: text('Meta line'), price: text('Price'), badge: text('Badge'),
    swatch: text('Swatch colour', { description: 'Hex, for the swatches layout' }), image: image('Image'),
    value: text('Value', { description: 'Stored with the order, e.g. 256GB' }),
  } },
  { name: 'reco_option', display_name: 'Recommendation', folder: 'Parts', is_nestable: true, preview_field: 'title', schema: {
    title: text('Title', { required: true }), meta: text('Meta line'), price: text('Price'), badge: text('Badge'),
    image: image('Image'), why: area('Why we picked this', { description: lines }), value: text('Value'),
  } },
  { name: 'form_field', display_name: 'Form field', folder: 'Parts', is_nestable: true, preview_field: 'label', schema: {
    label: text('Label', { required: true }),
    input_type: option('Input type', ['text', 'email', 'tel', 'date', 'password'], 'text'),
    options: area('Dropdown options', { description: `${lines}. Leave empty for a text input.` }),
    value: text('Prefilled value'), read_only: bool('Read only'),
  } },
  { name: 'summary_row', display_name: 'Summary row', folder: 'Parts', is_nestable: true, preview_field: 'label', schema: {
    label: text('Label', { required: true }), meta: text('Detail'), value: text('Value'), total: bool('Total row'),
  } },
  // Blocks: what a screen is composed from.
  { name: 'hero', display_name: 'Hero (handset)', folder: 'Blocks', is_nestable: true, preview_field: 'title', icon: 'block-image', color: '#0019a5', schema: {
    title: text('Title', { required: true }), subtitle: text('Subtitle'), image: image('Handset image'),
    from_price: text('From price'), badges: area('Badges', { description: lines }),
    rating: text('Rating', { description: 'e.g. 4.7' }), reviews: text('Review count'),
    specs: area('Key specs', { description: `${lines}, as "value | label"` }),
  } },
  { name: 'choice', display_name: 'Choice', folder: 'Blocks', is_nestable: true, preview_field: 'label', icon: 'block-buildin', color: '#0019a5', schema: {
    label: text('Label'),
    layout: option('Layout', ['swatches', 'chips', 'cards', 'list'], 'cards'),
    multi: text('Max selections', { description: 'Empty for single choice' }), default_option: text('Default option value'),
    options: bloks('Options', ['choice_option']),
  } },
  { name: 'reco', display_name: 'Recommendations', folder: 'Blocks', is_nestable: true, icon: 'block-star', color: '#0019a5', schema: {
    default_option: text('Default option value'), options: bloks('Recommendations', ['reco_option']),
  } },
  { name: 'splash', display_name: 'Splash', folder: 'Blocks', is_nestable: true, preview_field: 'title', icon: 'block-sticker', color: '#0019a5', schema: {
    title: text('Title', { required: true }), body: area('Body'), points: area('Points', { description: lines }), images: images('Images'),
  } },
  { name: 'offer', display_name: 'Offer', folder: 'Blocks', is_nestable: true, preview_field: 'title', icon: 'block-tag', color: '#e5007d', schema: {
    title: text('Title', { required: true }), body: area('Body'),
    bullets: area('Bullets', { description: lines }), price: text('Price', { description: 'Ending /mo shows "A MONTH"' }),
    image: image('Header background'), logo: image('Logo'), legal: area('Important information'),
  } },
  { name: 'form', display_name: 'Form', folder: 'Blocks', is_nestable: true, icon: 'block-text-l', color: '#0019a5', schema: {
    fields: bloks('Fields', ['form_field']),
  } },
  { name: 'result', display_name: 'Result', folder: 'Blocks', is_nestable: true, preview_field: 'title', icon: 'block-check', color: '#00a651', schema: {
    tone: option('Tone', ['good', 'warn'], 'good'), title: text('Title', { required: true }), body: area('Body'),
  } },
  { name: 'info_card', display_name: 'Info card', folder: 'Blocks', is_nestable: true, preview_field: 'title', icon: 'block-doc', color: '#0019a5', schema: {
    title: text('Title', { required: true }), lines: area('Lines', { description: lines }), image: image('Image'), logo: image('Logo'),
  } },
  { name: 'order_summary', display_name: 'Order summary', folder: 'Blocks', is_nestable: true, icon: 'block-table', color: '#0019a5', schema: {
    image: image('Handset image'), rows: bloks('Rows', ['summary_row']),
  } },
  { name: 'legal', display_name: 'Legal (expandable)', folder: 'Blocks', is_nestable: true, preview_field: 'title', icon: 'block-info', color: '#5f6b7a', schema: {
    title: text('Title', { required: true }), body: area('Body'),
  } },
  { name: 'note', display_name: 'Note', folder: 'Blocks', is_nestable: true, preview_field: 'body', icon: 'block-comment', color: '#5f6b7a', schema: {
    body: area('Body', { required: true }),
  } },

  // Page type: one step of a buying journey. Journeys are folders of steps.
  { name: 'journey_step', display_name: 'Journey step', folder: 'Pages', is_root: true, is_nestable: false, preview_field: 'title', icon: 'block-wallet', color: '#0019a5', schema: {
    title: text('Title'), subtitle: text('Subtitle'),
    blocks: bloks('Blocks', BLOCKS),
    primary_label: text('Button', { required: true }), primary_link: link('Button goes to'),
    secondary_label: text('Second button', { description: 'e.g. No thanks, Skip for now' }), secondary_link: link('Second button goes to'),
    back_link: link('Back goes to'),
    'tab-checkout': tab('Checkout', ['stage', 'secure_checkout', 'buttons_in_page', 'payment_logos']),
    stage: option('Progress step', ['Phone', 'Plan', 'Check', 'Details', 'Pay'], 'Phone'),
    secure_checkout: bool('Secure checkout header'), buttons_in_page: bool('Buttons in the page (no basket bar)'), payment_logos: bool('Show payment logos'),
    'tab-basket': tab('Basket bar', ['basket_label', 'basket_upfront', 'basket_monthly', 'basket_saving_label', 'basket_saving']),
    basket_label: text('Basket label', { description: 'Shown before a price exists' }), basket_upfront: text('Upfront'), basket_monthly: text('Monthly'),
    basket_saving_label: text('Saving label', { description: 'e.g. Trade-in. Defaults to Saving' }), basket_saving: text('Saving', { description: 'Any headline saving must show here as a number, e.g. Up to £146' }),
  } },
  // In-life app home (O2 In Life app journey): My O2 account + Priority, with an offer slot shown inline and as a bottom sheet.
  { name: 'app_header', display_name: 'App header', folder: 'App', is_nestable: true, preview_field: 'name', icon: 'block-image', color: '#0050ff', schema: {
    logo: image('Logo'), name: text('First name', { required: true }),
    greeting: option('Greeting', ['time', 'hello'], 'time'),
    number: text('Phone number'), plan_line: text('Plan line', { description: 'e.g. Pay Monthly · Priority member' }),
    notifications: bool('Unread notification dot'),
  } },
  { name: 'offer_slot', display_name: 'Offer slot (headline + pop-up)', folder: 'App', is_nestable: true, preview_field: 'alt', icon: 'block-tag', color: '#e5007d', schema: {
    creative_endpoint: text('Creative endpoint', { description: 'Public URL of the html-design function. On load the latest design fills both slots (pop-up + headline). Add ?status=live or ?tag=… to narrow it. Leave empty for the images below or grey placeholders.' }),
    headline_aspect: option('Headline slot shape', ['16/7', '4/3', '1/1'], '16/7'),
    headline_creative: image('Headline creative (fallback image)'), sheet_creative: image('Pop-up creative (fallback image)'),
    alt: text('Alt text'),
    'tab-popup': tab('Pop-up', ['open_on_load', 'delay_ms', 'dismiss_label']),
    open_on_load: { ...bool('Open pop-up on load'), default_value: true }, delay_ms: num('Delay before opening (ms)', { default_value: '700' }),
    dismiss_label: text('Dismiss label', { default_value: 'Not now' }),
    'tab-placeholder': tab('Placeholders', ['headline_placeholder', 'sheet_placeholder']),
    headline_placeholder: text('Headline placeholder', { default_value: 'Offer slot · headline' }),
    sheet_placeholder: text('Pop-up placeholder', { default_value: 'Offer slot · pop-up' }),
  } },
  { name: 'bill_card', display_name: 'Bill card', folder: 'App', is_nestable: true, preview_field: 'amount', icon: 'block-wallet', color: '#0019a5', schema: {
    amount: text('Amount', { required: true }), status: text('Status'), tone: option('Status tone', ['paid', 'due'], 'paid'),
    date_label: text('Date label'), date: text('Date'), link_label: text('Link label'),
  } },
  { name: 'plan_card', display_name: 'Plan card', folder: 'App', is_nestable: true, preview_field: 'number', icon: 'block-doc', color: '#0019a5', schema: {
    label: text('Label'), number: text('Number', { required: true }), description: text('Description'),
    footer_label: text('Footer label'), footer_value: text('Footer value'),
  } },
  { name: 'usage_card', display_name: 'Usage card', folder: 'App', is_nestable: true, preview_field: 'number', icon: 'block-table', color: '#0019a5', schema: {
    label: text('Label'), number: text('Number'),
    data_left: text('Data left'), data_unit: text('Data unit'), data_total: text('Data allowance'), data_percent: num('Data left (%)'),
    minutes_title: text('Minutes title'), minutes_value: text('Minutes value'),
  } },
  { name: 'priority_card', display_name: 'Priority card', folder: 'App', is_nestable: true, preview_field: 'title', icon: 'block-star', color: '#00003c', schema: {
    kicker: text('Kicker'), title: text('Title', { required: true }), body: text('Body'),
    image: image('Image'), image_position: text('Image focus', { description: 'CSS object-position, e.g. center bottom' }),
  } },
  { name: 'priority_banner', display_name: 'Priority banner', folder: 'App', is_nestable: true, preview_field: 'title', icon: 'block-sticker', color: '#00003c', schema: {
    highlight: text('Highlight word'), title: text('Title', { required: true }), body: text('Body'),
  } },
  { name: 'priority_section', display_name: 'Priority section', folder: 'App', is_nestable: true, preview_field: 'title', icon: 'block-star', color: '#00003c', schema: {
    wordmark: text('Wordmark'), title: text('Title', { required: true }), link_label: text('Link label'),
    tabs: area('Tabs', { description: lines }),
    cards: bloks('Cards', ['priority_card']), banner: bloks('Banner', ['priority_banner'], { maximum: 1 }),
  } },
  { name: 'app_nav_tab', display_name: 'Nav tab', folder: 'App', is_nestable: true, preview_field: 'label', icon: 'block-buildin', color: '#0050ff', schema: {
    label: text('Label', { required: true }), icon: option('Icon', ['home', 'offers', 'tickets', 'help', 'account'], 'home'), active: bool('Current tab'),
  } },
  { name: 'app_home', display_name: 'App home', folder: 'Pages', is_root: true, is_nestable: false, preview_field: 'title', icon: 'block-image', color: '#0050ff', schema: {
    title: text('Title', { description: 'Browser tab title' }),
    blocks: bloks('Blocks', APP_BLOCKS), nav: bloks('Bottom nav', ['app_nav_tab'], { maximum: 5 }),
  } },
];
