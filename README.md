# City Line Tours And Travels - Kashmir Tourism Platform

> **Tagline:** *Where Your Travel Dreams Take Flight*  
> **Brand Identity:** Classic • Premium • Elegant • Icon-Oriented  
> **Colors:** Primary Blue (`#145DA0`) & Deep Navy (`#0B2545`) with White & Light Blue accents  
> **Typography:** Georgia Bold (Traditional serif headings) & Inter (Modern, readable UI & body)

---

## 🌟 Key Features

### 1. Customer-Facing Website (13 Rich Pages & Sections)
- **Homepage (`/`)**:
  - Full-width cinematic hero with slow zoom and Georgia Bold typography
  - Quick Enquiry bar below hero (Destination, Travel Date, Guests, Phone/Email)
  - Editorial Introduction to Kashmir & City Line Tours
  - "Travel With Confidence" (Why Choose Us) with 6 Lucide icon cards
  - Regional Wonders (Srinagar, Gulmarg, Pahalgam, Sonamarg, Doodhpathri, Yusmarg, Gurez)
  - Popular Tour Packages with information badges, prices, and direct enquiry
  - Signature Experiences (Shikara, Houseboat, Gondola, Snow Sports, Mughal Gardens, Wazwan)
  - 4-Step Customer Booking Journey
  - Genuine reviews & testimonials
  - Tailor-Made "Your Kashmir, Your Way" CTA
  - Interactive Accordion FAQs
  - 4-Column Deep Navy Footer with WhatsApp integration & sticky header
- **All Tour Packages (`/packages`)**: Category filtering (Family, Honeymoon, Budget, Luxury, Group, Customised).
- **Package Details (`/packages/:slug`)**: Full day-wise itinerary, inclusions, exclusions, stay details, private vehicle info, and sticky enquiry card.
- **Destinations Guide (`/destinations` & `/destinations/:slug`)**: Dedicated guides for Srinagar, Gulmarg, Pahalgam, Sonamarg, Doodhpathri, Yusmarg, and Gurez Valley with best time to visit, key attractions, and things to do.
- **Customized Trip Planner (`/customize-trip`)**: Multi-step planner capturing customer travel dates, duration, budget, accommodation preference, travel style, and destinations.
- **Experiences Showcase (`/experiences`)**: Detailed guides to signature activities with instant inquiry buttons.
- **Hotels & Stays (`/hotels`)**: Houseboats, mountain resorts, and deluxe city hotels.
- **Photo Gallery (`/gallery`)**: High-resolution Kashmir landscape photography.
- **Contact Us (`/contact`)**: Direct contact form, phone numbers, WhatsApp, email, office address, and business hours.
- **FAQs (`/faq`)**: Complete Kashmir travel guide and packing advice.
- **Terms & Policies (`/terms`)**: Transparent Privacy Policy, Booking Terms, and Cancellation Policy.

---

### 2. Email Notification & Customer Lead Delivery
When any visitor submits an enquiry (Quick Enquiry, Package Enquiry, Custom Trip Planner, or Contact Form):
1. **Immediate Email to You (Business Owner)**:
   - Delivers customer's Full Name, Phone number, Email address, Destination, Package, Dates, Travellers, Budget, and special notes.
   - Includes quick click-to-call, click-to-email, and one-click WhatsApp response buttons.
2. **Automated Confirmation Email to Customer**:
   - Sends a warm Kashmiri welcome to the customer's email.
   - Summarizes their enquiry details and gives direct helpline numbers to reach you immediately.
3. **Email Outbox & Log in Admin**:
   - Even before you configure SMTP, the system simulates and logs every email in `/admin/emails` with a full HTML preview, ensuring 100% reliable submission without error.
   - Ready for live delivery with Gmail, Outlook, Zoho, or any SMTP host.

---

### 3. Administrative Management Dashboard (`/admin`)
- **Protected by session authentication** (Default password: `admin123`).
- **Dashboard Overview**: Metrics on Total Enquiries, New leads, Confirmed bookings, Active packages, and Destinations.
- **Enquiries Management (`/admin/enquiries`)**:
  - Filter by status: *New, Contacted, Follow-up Required, Quotation Sent, Confirmed, Cancelled, Closed*.
  - Search by customer name, phone, email, or enquiry reference ID.
  - Add internal follow-up notes to any customer record.
  - One-click **Export to CSV** for spreadsheets or CRM.
- **Package Management (`/admin/packages`)**: Add, edit, or delete packages; update pricing, duration, categories, and itineraries.
- **Destination Management (`/admin/destinations`)**: Add, edit, or update destinations and attractions.
- **Email Notification Outbox (`/admin/emails`)**: View every dispatched email and test your SMTP inbox delivery in real time with one click.
- **Settings (`/admin/settings`)**: Update company phone, WhatsApp, email, forwarding address, and SMTP credentials.

---

## 🚀 How to Run the Website

### Prerequisites
- Node.js (v18 or higher installed)

### 1. Start the Server
In the project directory, run:
```bash
npm start
```
*(or run `node server.js`)*

### 2. Open in Browser
- **Public Website:** [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)
  - **Password:** `admin123`

---

## 📧 How to Configure Live Email Delivery to Your Inbox

1. Log in to [http://localhost:3000/admin](http://localhost:3000/admin) and go to **Settings** (or edit `.env`).
2. Set your **Customer Enquiry Email Destination** to your personal email address.
3. To deliver through **Gmail**:
   - Go to your Google Account > **Security** > **2-Step Verification**.
   - Under 2-Step Verification, generate an **App Password** (e.g. named "CityLineWebsite").
   - In Admin Settings, enter:
     - **SMTP Host:** `smtp.gmail.com`
     - **SMTP Port:** `587`
     - **SMTP Username:** your Gmail address
     - **SMTP Password:** the 16-character App Password
4. Click **Save Settings**, then visit **Email Logs** and click **Send Test Email** to verify!

