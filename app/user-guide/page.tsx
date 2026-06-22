import React from 'react';

export const metadata = {
  title: 'User Guide — Platform',
  description: 'Plain-language, screen-by-screen user guide for all users (authenticated and not).',
};

export default function UserGuidePage() {
  return (
    <section style={{padding: '32px', maxWidth: 980, margin: '0 auto'}}>
      <header style={{marginBottom: 24}}>
        <h1 style={{fontSize: 28, margin: 0}}>Platform User Guide (Simple, Screen-by-Screen)</h1>
        <p style={{marginTop: 8, color: '#555'}}>A plain-language guide for everyone — buyers, sellers, and admins. No technical jargon.</p>
      </header>

      <nav aria-label="Quick links" style={{marginBottom: 24}}>
        <strong>Quick jump:</strong> Home • Search • Cards • Item detail • Cart & Checkout • Orders • Messages • Profile • Seller pages • Admin pages • Help
      </nav>

      <article>
        <section style={{marginBottom: 20}}>
          <h2>Intro — how to use this guide</h2>
          <p>This guide explains what you will see on each main screen of the platform and what the important buttons and labels mean. It is written for people who do not want technical details — only clear explanations and simple steps.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Home / Landing screen</h2>
          <p><strong>What you see:</strong> A welcome banner and a big search box. You may also see quick links like <em>Search</em>, <em>My account</em>, <em>Help</em>, and a few featured items.</p>
          <p><strong>What it means:</strong> This is the starting page. Use the search box to look for things, or click featured items to explore.</p>
          <p><strong>What you can do:</strong> Type a few words into the search box (example: "blue jacket") and press Enter, or click any featured item to learn more.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Search screen (where you find things)</h2>
          <p><strong>What you see:</strong> A search input at the top and results below. You will also see filters (category, price, location), sort options (Best match, Newest, Price), and suggested searches in some cases.</p>
          <p><strong>What it means:</strong> The search shows results that match what you typed and the filters you selected.</p>
          <p><strong>What you can do:</strong> Add filters to make results more specific, change the sort order, and click any item card to open its detail page.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Results list &amp; cards (quick summary for each item)</h2>
          <p><strong>What you see:</strong> Small boxes (cards) for each item with a picture, a title, short info, price, and small labels like "New" or "On sale".</p>
          <p><strong>What it means:</strong> Each card gives a quick snapshot so you can decide whether to open the full detail.</p>
          <p><strong>What you can do:</strong> Hover or tap a card for quick actions (save or share) and click the card to view full details.</p>

          <h3>Common things on a card and plain meanings</h3>
          <ul>
            <li><strong>Image:</strong> What the item looks like.</li>
            <li><strong>Title:</strong> Item name.</li>
            <li><strong>Price:</strong> How much the item costs.</li>
            <li><strong>Badges/labels:</strong> Quick notes such as "New" or "Free shipping".</li>
            <li><strong>Availability label:</strong> Short text like "In stock", "Only a few left", or "Out of stock".</li>
            <li><strong>Action button:</strong> Usually <em>View</em>, <em>Buy</em>, or <em>Save</em>.</li>
          </ul>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Item / Listing detail page (full information)</h2>
          <p><strong>What you see:</strong> Large photos, full description, seller details, shipping info, customer reviews, and buttons such as <em>Buy</em>, <em>Save</em>, or <em>Contact seller</em>.</p>
          <p><strong>What it means:</strong> This page gives you everything you need to decide whether to buy the item.</p>
          <p><strong>What you can do:</strong> Choose options (size or color), select quantity, click <em>Buy</em> or <em>Add to cart</em>, or contact the seller with questions.</p>
          <p><strong>Notes:</strong> The detail page usually shows the most up-to-date availability and shipping estimates.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Cart and Checkout (paying for items)</h2>
          <p><strong>What you see:</strong> A list of items you want to buy, the total price, shipping or pickup options, and payment method selection.</p>
          <p><strong>What it means:</strong> The cart is where you prepare to pay. The system will check whether items are still available before finalizing payment.</p>
          <p><strong>What you can do:</strong> Change quantities, remove items, choose shipping address and payment, and complete the purchase.</p>
          <p><strong>Tip:</strong> If stock changes during checkout, the platform will notify you and give options (remove the item, wait for restock, or choose a different one).</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Orders &amp; Order details</h2>
          <p><strong>What you see:</strong> A list of your past and current orders with statuses such as <em>Processing</em>, <em>Shipped</em>, or <em>Delivered</em>.</p>
          <p><strong>What it means:</strong> This tracks where your purchases are and shows history.</p>
          <p><strong>What you can do:</strong> Click any order for more details, tracking numbers, and options like returns or contacting support.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Messages / Conversations</h2>
          <p><strong>What you see:</strong> A list of conversations with sellers or support and any unread messages.</p>
          <p><strong>What it means:</strong> A place to ask questions about items or follow up after a purchase.</p>
          <p><strong>What you can do:</strong> Send messages, attach photos if allowed, and save important messages.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Saved / Watchlist / Favorites</h2>
          <p><strong>What you see:</strong> Items you saved to check again later.</p>
          <p><strong>What it means:</strong> A personal list of items you like or want to monitor.</p>
          <p><strong>What you can do:</strong> Move items to cart, remove them, or share with someone.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Profile / Account settings</h2>
          <p><strong>What you see:</strong> Your name, contact info, addresses, payment methods, and notification preferences.</p>
          <p><strong>What it means:</strong> This is where you manage how the platform contacts you and stores your details.</p>
          <p><strong>What you can do:</strong> Update address and payment details, change password, and manage notifications.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Help / Support and Reports</h2>
          <p><strong>What you see:</strong> Frequently asked questions (FAQ), a contact form, and support ticket status.</p>
          <p><strong>What it means:</strong> Where to find answers or get help if something goes wrong.</p>
          <p><strong>What you can do:</strong> Search the FAQ, open a support ticket, or start a chat if available.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Seller / Provider screens (if you sell)</h2>
          <p><strong>Seller Dashboard:</strong> A control center showing your listings, recent sales, and alerts.</p>
          <p><strong>Create / Edit listing:</strong> A simple form to add title, photos, description, price, shipping info, and inventory count.</p>
          <p><strong>Inventory page:</strong> Shows how many of each item you have and allows quick updates.</p>
          <p><strong>Tips:</strong> Use clear photos, honest descriptions, and update inventory right after receiving stock or returns.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Admin screens (for platform managers)</h2>
          <p>Only visible to admins. These screens allow people who manage the platform to do things like:</p>
          <ul>
            <li>See overall platform health (users, sales, alerts)</li>
            <li>Manage user accounts and roles</li>
            <li>Review reports and remove or edit problematic listings</li>
            <li>Adjust simple settings like how availability is described to users</li>
          </ul>
          <p><strong>In plain words:</strong> Admins see a control room with tools to help users and fix problems.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Availability labels and what they mean (simple)</h2>
          <p>Throughout the site you may see short labels like "In stock", "Only a few left", or "Out of stock". These are simple signals to help you decide quickly:</p>
          <ul>
            <li><strong>In stock / High:</strong> Plenty available — you can buy without worry.</li>
            <li><strong>Mid / Some available:</strong> A normal amount left — available but not unlimited.</li>
            <li><strong>Low / Only a few left:</strong> Very few remain — consider buying now.</li>
            <li><strong>Out of stock:</strong> Not available right now.</li>
          </ul>
          <p><strong>Tip:</strong> If you see "Only a few left" and really want the item, click it and complete checkout to avoid losing it.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Common flows — short step lists</h2>
          <h3>Search and buy (buyer)</h3>
          <ol>
            <li>Type what you want in Search.</li>
            <li>Scan cards and open items you like.</li>
            <li>Add to cart and checkout.</li>
            <li>Track the order via Orders page.</li>
          </ol>

          <h3>Create an item (seller)</h3>
          <ol>
            <li>Go to Seller Dashboard &gt; Create Listing.</li>
            <li>Add photos, title, description, price, and stock count.</li>
            <li>Publish the listing.</li>
          </ol>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Non-technical troubleshooting — quick fixes</h2>
          <p><strong>If item says available in search but "Out of stock" in detail:</strong> Refresh the detail page, check your cart (maybe you reserved it), or contact support with a screenshot.</p>
          <p><strong>If checkout fails:</strong> Check payment details and address, try a different card, or contact support with the error text.</p>
          <p><strong>If your listing disappeared:</strong> Check whether it was unpublished, or contact support to find out why.</p>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>Security &amp; privacy (plain words)</h2>
          <ul>
            <li>Use a strong, unique password and do not share it.</li>
            <li>Do not send payment details in messages.</li>
            <li>Report suspicious activity to Support immediately.</li>
          </ul>
        </section>

        <section style={{marginBottom: 20}}>
          <h2>One-page quick reference (printable)</h2>
          <p>Quick steps: 1) Search → 2) Check the card → 3) Open detail → 4) Add to cart → 5) Checkout → 6) Track via Orders → 7) Use Help if needed.</p>
        </section>

        <footer style={{marginTop: 32, paddingTop: 12, borderTop: '1px solid #eee'}}>
          <p style={{margin: 0}}>If you want this guide tailored to match exact screenshots or labels on your site, I can update the wording and add screenshots. I can also commit this page into your codebase at <code>/user-guide/page.tsx</code> now — tell me if you want that and which branch to use.</p>
        </footer>
      </article>
    </section>
  );
}
