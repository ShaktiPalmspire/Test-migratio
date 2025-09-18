// HubSpot Default Properties - Unified File
// Contains ALL properties where "hubspotDefined": true from all object types
// Generated from: Contacts, Companies, Deals, and Tickets

export interface HubSpotDefaultProperty {
  type: string;
  fieldType: string;
  name: string;
  label: string;
  sr_no?: number;
  required?: boolean;
}

// ==========================================
// CONTACT PROPERTIES (355 properties)
// ==========================================
// These are default HubSpot contact fields like email, firstname, lastname, etc.
export const hubspotContactProperties: HubSpotDefaultProperty[] = [
  {
    "name": "hs_additional_emails",
    "label": "Additional email addresses",
    "sr_no": 1,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_data_privacy_ads_consent",
    "label": "Ads Consent from Forms",
    "sr_no": 2,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_all_owner_ids",
    "label": "All owner IDs",
    "sr_no": 3,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_all_team_ids",
    "label": "All team IDs",
    "sr_no": 4,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_all_accessible_team_ids",
    "label": "All teams",
    "sr_no": 5,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_all_contact_vids",
    "label": "All vids for a contact",
    "sr_no": 6,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "annualrevenue",
    "label": "Annual Revenue",
    "sr_no": 7,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "associatedcompanylastupdated",
    "label": "Associated Company Last Updated",
    "sr_no": 8,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_associated_target_accounts",
    "label": "Associated Target Accounts",
    "sr_no": 9,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_avatar_filemanager_key",
    "label": "Avatar FileManager key",
    "sr_no": 10,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_average_page_views",
    "label": "Average Pageviews",
    "sr_no": 11,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_all_assigned_business_unit_ids",
    "label": "Brands",
    "sr_no": 12,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_social_num_broadcast_clicks",
    "label": "Broadcast Clicks",
    "sr_no": 13,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_buying_role",
    "label": "Buying Role",
    "sr_no": 14,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_calculated_mobile_number",
    "label": "Calculated Mobile Number in International Format",
    "sr_no": 15,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_searchable_calculated_international_mobile_number",
    "label": "Calculated Mobile Number with country code",
    "sr_no": 16,
    "type": "phone_number",
    "fieldType": "phonenumber"
  },
  {
    "name": "hs_searchable_calculated_mobile_number",
    "label": "Calculated Mobile Number without country code",
    "sr_no": 17,
    "type": "phone_number",
    "fieldType": "phonenumber"
  },
  {
    "name": "hs_calculated_phone_number_area_code",
    "label": "Calculated Phone Number Area Code",
    "sr_no": 18,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_calculated_phone_number_country_code",
    "label": "Calculated Phone Number Country Code",
    "sr_no": 19,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_calculated_phone_number",
    "label": "Calculated Phone Number in International Format",
    "sr_no": 20,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_calculated_phone_number_region_code",
    "label": "Calculated Phone Number Region",
    "sr_no": 21,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_searchable_calculated_international_phone_number",
    "label": "Calculated Phone Number with country code",
    "sr_no": 22,
    "type": "phone_number",
    "fieldType": "phonenumber"
  },
  {
    "name": "hs_searchable_calculated_phone_number",
    "label": "Calculated Phone Number without country code",
    "sr_no": 23,
    "type": "phone_number",
    "fieldType": "phonenumber"
  },
  {
    "name": "engagements_last_meeting_booked_campaign",
    "label": "Campaign of last booking in meetings tool",
    "sr_no": 24,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "city",
    "label": "City",
    "sr_no": 25,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_facebook_ad_clicked",
    "label": "Clicked Facebook ad",
    "sr_no": 26,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_linkedin_ad_clicked",
    "label": "Clicked LinkedIn Ad",
    "sr_no": 27,
    "type": "enumeration",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_clicked_linkedin_ad",
    "label": "Clicked on a LinkedIn Ad",
    "sr_no": 28,
    "type": "enumeration",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "closedate",
    "label": "Close Date",
    "sr_no": 29,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "company",
    "label": "Company Name",
    "sr_no": 30,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "company_size",
    "label": "Company size",
    "sr_no": 31,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_contact_creation_legal_basis_source_instance_id",
    "label": "Contact creation legal basis source instance ID",
    "sr_no": 32,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_has_active_subscription",
    "label": "Contact has an active subscription",
    "sr_no": 33,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hubspot_owner_id",
    "label": "Contact owner",
    "sr_no": 34,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_predictivescoringtier",
    "label": "Contact priority",
    "sr_no": 35,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_is_unworked",
    "label": "Contact unworked",
    "sr_no": 36,
    "type": "bool",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_conversations_visitor_email",
    "label": "Conversations visitor email",
    "sr_no": 37,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_count_is_worked",
    "label": "Count of engaged contacts",
    "sr_no": 38,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_count_is_unworked",
    "label": "Count of unengaged contacts",
    "sr_no": 39,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "country",
    "label": "Country/Region",
    "sr_no": 40,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_country_region_code",
    "label": "Country/Region Code",
    "sr_no": 41,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "createdate",
    "label": "Create Date",
    "sr_no": 42,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_created_by_conversations",
    "label": "Created By Conversations",
    "sr_no": 43,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_created_by_user_id",
    "label": "Created by user ID",
    "sr_no": 44,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_cross_sell_opportunity",
    "label": "Cross-sell Opportunity",
    "sr_no": 45,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_v2_cumulative_time_in_customer",
    "label": "Cumulative time in \"Customer (Lifecycle Stage Pipeline)\"",
    "sr_no": 46,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_evangelist",
    "label": "Cumulative time in \"Evangelist (Lifecycle Stage Pipeline)\"",
    "sr_no": 47,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_lead",
    "label": "Cumulative time in \"Lead (Lifecycle Stage Pipeline)\"",
    "sr_no": 48,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_marketingqualifiedlead",
    "label": "Cumulative time in \"Marketing Qualified Lead (Lifecycle Stage Pipeline)\"",
    "sr_no": 49,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_opportunity",
    "label": "Cumulative time in \"Opportunity (Lifecycle Stage Pipeline)\"",
    "sr_no": 50,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_other",
    "label": "Cumulative time in \"Other (Lifecycle Stage Pipeline)\"",
    "sr_no": 51,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_salesqualifiedlead",
    "label": "Cumulative time in \"Sales Qualified Lead (Lifecycle Stage Pipeline)\"",
    "sr_no": 52,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_subscriber",
    "label": "Cumulative time in \"Subscriber (Lifecycle Stage Pipeline)\"",
    "sr_no": 53,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_currently_enrolled_in_prospecting_agent",
    "label": "Currently Enrolled in Prospecting Agent",
    "sr_no": 54,
    "type": "bool",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_sequences_is_enrolled",
    "label": "Currently in Sequence",
    "sr_no": 55,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "currentlyinworkflow",
    "label": "Currently in workflow (discontinued)",
    "sr_no": 56,
    "type": "enumeration",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_customer_agent_lead_status",
    "label": "Customer Agent Lead Status",
    "sr_no": 57,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_v2_date_entered_customer",
    "label": "Date entered \"Customer (Lifecycle Stage Pipeline)\"",
    "sr_no": 58,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_evangelist",
    "label": "Date entered \"Evangelist (Lifecycle Stage Pipeline)\"",
    "sr_no": 59,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_lead",
    "label": "Date entered \"Lead (Lifecycle Stage Pipeline)\"",
    "sr_no": 60,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_marketingqualifiedlead",
    "label": "Date entered \"Marketing Qualified Lead (Lifecycle Stage Pipeline)\"",
    "sr_no": 61,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_opportunity",
    "label": "Date entered \"Opportunity (Lifecycle Stage Pipeline)\"",
    "sr_no": 62,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_other",
    "label": "Date entered \"Other (Lifecycle Stage Pipeline)\"",
    "sr_no": 63,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_salesqualifiedlead",
    "label": "Date entered \"Sales Qualified Lead (Lifecycle Stage Pipeline)\"",
    "sr_no": 64,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_subscriber",
    "label": "Date entered \"Subscriber (Lifecycle Stage Pipeline)\"",
    "sr_no": 65,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_customer",
    "label": "Date exited \"Customer (Lifecycle Stage Pipeline)\"",
    "sr_no": 66,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_evangelist",
    "label": "Date exited \"Evangelist (Lifecycle Stage Pipeline)\"",
    "sr_no": 67,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_lead",
    "label": "Date exited \"Lead (Lifecycle Stage Pipeline)\"",
    "sr_no": 68,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_marketingqualifiedlead",
    "label": "Date exited \"Marketing Qualified Lead (Lifecycle Stage Pipeline)\"",
    "sr_no": 69,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_opportunity",
    "label": "Date exited \"Opportunity (Lifecycle Stage Pipeline)\"",
    "sr_no": 70,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_other",
    "label": "Date exited \"Other (Lifecycle Stage Pipeline)\"",
    "sr_no": 71,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_salesqualifiedlead",
    "label": "Date exited \"Sales Qualified Lead (Lifecycle Stage Pipeline)\"",
    "sr_no": 72,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_subscriber",
    "label": "Date exited \"Subscriber (Lifecycle Stage Pipeline)\"",
    "sr_no": 73,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "date_of_birth",
    "label": "Date of birth",
    "sr_no": 74,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_sa_first_engagement_date",
    "label": "Date of first engagement",
    "sr_no": 75,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "engagements_last_meeting_booked",
    "label": "Date of last meeting booked in meetings tool",
    "sr_no": 76,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "days_to_close",
    "label": "Days To Close",
    "sr_no": 77,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "degree",
    "label": "Degree",
    "sr_no": 78,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_sa_first_engagement_descr",
    "label": "Description of first engagement",
    "sr_no": 79,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_content_membership_registration_domain_sent_to",
    "label": "Domain to which registration email was sent",
    "sr_no": 80,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "email",
    "label": "Email",
    "sr_no": 81,
    "type": "string",
    "fieldType": "text",
    "required": true
  },
  {
    "name": "hs_email_quarantined_reason",
    "label": "Email address automated quarantine reason",
    "sr_no": 82,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_email_customer_quarantined_reason",
    "label": "Email address quarantine reason",
    "sr_no": 83,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_email_quarantined",
    "label": "Email Address Quarantined",
    "sr_no": 84,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_email_recipient_fatigue_recovery_time",
    "label": "Email Address Recipient Fatigue Next Available Sending Time",
    "sr_no": 85,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_content_membership_email_confirmed",
    "label": "Email Confirmed",
    "sr_no": 86,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_email_domain",
    "label": "Email Domain",
    "sr_no": 87,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_email_hard_bounce_reason",
    "label": "Email hard bounce reason",
    "sr_no": 88,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_email_hard_bounce_reason_enum",
    "label": "Email hard bounce reason",
    "sr_no": 89,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_employment_change_detected_date",
    "label": "Employment change detected date",
    "sr_no": 90,
    "type": "date",
    "fieldType": "date"
  },
  {
    "name": "hs_role",
    "label": "Employment Role",
    "sr_no": 91,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_seniority",
    "label": "Employment Seniority",
    "sr_no": 92,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_sub_role",
    "label": "Employment Sub Role",
    "sr_no": 93,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_enriched_email_bounce_detected",
    "label": "Enriched Email Bounce Detected",
    "sr_no": 94,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_contact_enrichment_opt_out",
    "label": "Enrichment opt out",
    "sr_no": 95,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_contact_enrichment_opt_out_timestamp",
    "label": "Enrichment opt out timestamp",
    "sr_no": 96,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_analytics_revenue",
    "label": "Event Revenue",
    "sr_no": 97,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_facebook_click_id",
    "label": "Facebook click id",
    "sr_no": 98,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_social_facebook_clicks",
    "label": "Facebook Clicks",
    "sr_no": 99,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_facebookid",
    "label": "Facebook ID",
    "sr_no": 100,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "fax",
    "label": "Fax Number",
    "sr_no": 101,
    "type": "string",
    "fieldType": "phonenumber"
  },
  {
    "name": "field_of_study",
    "label": "Field of study",
    "sr_no": 102,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_first_closed_order_id",
    "label": "First Closed Order ID",
    "sr_no": 103,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "first_conversion_event_name",
    "label": "First Conversion",
    "sr_no": 104,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "first_conversion_date",
    "label": "First Conversion Date",
    "sr_no": 105,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "first_deal_created_date",
    "label": "First Deal Created Date",
    "sr_no": 106,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_email_first_click_date",
    "label": "First marketing email click date",
    "sr_no": 107,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_email_first_open_date",
    "label": "First marketing email open date",
    "sr_no": 108,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_email_first_reply_date",
    "label": "First marketing email reply date",
    "sr_no": 109,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_email_first_send_date",
    "label": "First marketing email send date",
    "sr_no": 110,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "firstname",
    "label": "First Name",
    "sr_no": 111,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_first_order_closed_date",
    "label": "First Order Closed Date",
    "sr_no": 112,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_first_outreach_date",
    "label": "First outreach date",
    "sr_no": 113,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_analytics_first_url",
    "label": "First Page Seen",
    "sr_no": 114,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_first_referrer",
    "label": "First Referring Site",
    "sr_no": 115,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_first_subscription_create_date",
    "label": "First subscription create date",
    "sr_no": 116,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_analytics_first_touch_converting_campaign",
    "label": "First Touch Converting Campaign",
    "sr_no": 117,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "followercount",
    "label": "Follower Count",
    "sr_no": 118,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_full_name_or_email",
    "label": "Full name or email",
    "sr_no": 119,
    "type": "string",
    "fieldType": "calculation_equation"
  },
  {
    "name": "gender",
    "label": "Gender",
    "sr_no": 120,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_google_click_id",
    "label": "Google ad click id",
    "sr_no": 121,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_social_google_plus_clicks",
    "label": "Google Plus Clicks",
    "sr_no": 122,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_googleplusid",
    "label": "googleplus ID",
    "sr_no": 123,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_gps_error",
    "label": "GPS Error",
    "sr_no": 124,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "graduation_date",
    "label": "Graduation date",
    "sr_no": 125,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_is_enriched",
    "label": "Has been enriched",
    "sr_no": 126,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "owneremail",
    "label": "HubSpot Owner Email (legacy)",
    "sr_no": 127,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "ownername",
    "label": "HubSpot Owner Name (legacy)",
    "sr_no": 128,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hubspotscore",
    "label": "HubSpot Score",
    "sr_no": 129,
    "type": "number",
    "fieldType": "calculation_score"
  },
  {
    "name": "hubspot_team_id",
    "label": "HubSpot Team",
    "sr_no": 130,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_first_engagement_object_id",
    "label": "ID of first engagement",
    "sr_no": 131,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "industry",
    "label": "Industry",
    "sr_no": 132,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_inferred_language_codes",
    "label": "Inferred Language Codes",
    "sr_no": 133,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_intent_paid_up_to_date",
    "label": "Intent paid up to date",
    "sr_no": 134,
    "type": "date",
    "fieldType": "date"
  },
  {
    "name": "hs_intent_signals_enabled",
    "label": "Intent Signals active",
    "sr_no": 135,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_email_bad_address",
    "label": "Invalid email address",
    "sr_no": 136,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "ip_city",
    "label": "IP City",
    "sr_no": 137,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "ip_country",
    "label": "IP Country",
    "sr_no": 138,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "ip_country_code",
    "label": "IP Country Code",
    "sr_no": 139,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "ip_latlon",
    "label": "IP Latitude & Longitude",
    "sr_no": 140,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "ip_state_code",
    "label": "IP State Code/Region Code",
    "sr_no": 141,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "ip_state",
    "label": "IP State/Region",
    "sr_no": 142,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_ip_timezone",
    "label": "IP Timezone",
    "sr_no": 143,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "ip_zipcode",
    "label": "IP Zipcode",
    "sr_no": 144,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_is_contact",
    "label": "Is a contact",
    "sr_no": 145,
    "type": "bool",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_email_is_ineligible",
    "label": "Is globally ineligible",
    "sr_no": 146,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_job_change_detected_date",
    "label": "Job change detected date",
    "sr_no": 147,
    "type": "date",
    "fieldType": "date"
  },
  {
    "name": "job_function",
    "label": "Job function",
    "sr_no": 148,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "jobtitle",
    "label": "Job Title",
    "sr_no": 149,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_journey_stage",
    "label": "Journey Stage",
    "sr_no": 150,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "kloutscoregeneral",
    "label": "Klout Score",
    "sr_no": 151,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_notes_last_activity",
    "label": "Last Activity",
    "sr_no": 152,
    "type": "object_coordinates",
    "fieldType": "text"
  },
  {
    "name": "notes_last_updated",
    "label": "Last Activity Date",
    "sr_no": 153,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_feedback_last_ces_survey_follow_up",
    "label": "Last CES survey comment",
    "sr_no": 154,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_feedback_last_ces_survey_date",
    "label": "Last CES survey date",
    "sr_no": 155,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_feedback_last_ces_survey_rating",
    "label": "Last CES survey rating",
    "sr_no": 156,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "notes_last_contacted",
    "label": "Last Contacted",
    "sr_no": 157,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_feedback_last_csat_survey_follow_up",
    "label": "Last CSAT survey comment",
    "sr_no": 158,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_feedback_last_csat_survey_date",
    "label": "Last CSAT survey date",
    "sr_no": 159,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_feedback_last_csat_survey_rating",
    "label": "Last CSAT survey rating",
    "sr_no": 160,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_last_sales_activity_timestamp",
    "label": "Last Engagement Date",
    "sr_no": 161,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_sales_activity_type",
    "label": "Last Engagement Type",
    "sr_no": 162,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_email_last_click_date",
    "label": "Last marketing email click date",
    "sr_no": 163,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_email_last_email_name",
    "label": "Last marketing email name",
    "sr_no": 164,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_email_last_open_date",
    "label": "Last marketing email open date",
    "sr_no": 165,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_email_last_reply_date",
    "label": "Last marketing email reply date",
    "sr_no": 166,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_email_last_send_date",
    "label": "Last marketing email send date",
    "sr_no": 167,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_metered_enrichment_timestamp",
    "label": "Last Metered Enrichment Timestamp",
    "sr_no": 168,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "lastmodifieddate",
    "label": "Last Modified Date",
    "sr_no": 169,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "lastname",
    "label": "Last Name",
    "sr_no": 170,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_feedback_last_nps_follow_up",
    "label": "Last NPS survey comment",
    "sr_no": 171,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_feedback_last_survey_date",
    "label": "Last NPS survey date",
    "sr_no": 172,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_feedback_last_nps_rating",
    "label": "Last NPS survey rating",
    "sr_no": 173,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_analytics_last_url",
    "label": "Last Page Seen",
    "sr_no": 174,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_last_referrer",
    "label": "Last Referring Site",
    "sr_no": 175,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_last_sales_activity_date",
    "label": "last sales activity date old",
    "sr_no": 176,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_latest_sequence_ended_date",
    "label": "Last sequence ended date",
    "sr_no": 177,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_latest_sequence_enrolled",
    "label": "Last sequence enrolled",
    "sr_no": 178,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_latest_sequence_enrolled_date",
    "label": "Last sequence enrolled date",
    "sr_no": 179,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_latest_sequence_finished_date",
    "label": "Last sequence finished date",
    "sr_no": 180,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_latest_sequence_unenrolled_date",
    "label": "Last sequence unenrolled date",
    "sr_no": 181,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_sms_send_date",
    "label": "Last Sms Send Date",
    "sr_no": 182,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_sms_send_name",
    "label": "Last SMS Send Name",
    "sr_no": 183,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_last_touch_converting_campaign",
    "label": "Last Touch Converting Campaign",
    "sr_no": 184,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_latest_disqualified_lead_date",
    "label": "Latest Disqualified Lead Date",
    "sr_no": 185,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_meeting_activity",
    "label": "Latest meeting activity",
    "sr_no": 186,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_latest_open_lead_date",
    "label": "Latest Open Lead Date",
    "sr_no": 187,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_qualified_lead_date",
    "label": "Latest Qualified Lead Date",
    "sr_no": 188,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_subscription_create_date",
    "label": "Latest subscription create date",
    "sr_no": 189,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_v2_latest_time_in_customer",
    "label": "Latest time in \"Customer (Lifecycle Stage Pipeline)\"",
    "sr_no": 190,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_evangelist",
    "label": "Latest time in \"Evangelist (Lifecycle Stage Pipeline)\"",
    "sr_no": 191,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_lead",
    "label": "Latest time in \"Lead (Lifecycle Stage Pipeline)\"",
    "sr_no": 192,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_marketingqualifiedlead",
    "label": "Latest time in \"Marketing Qualified Lead (Lifecycle Stage Pipeline)\"",
    "sr_no": 193,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_opportunity",
    "label": "Latest time in \"Opportunity (Lifecycle Stage Pipeline)\"",
    "sr_no": 194,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_other",
    "label": "Latest time in \"Other (Lifecycle Stage Pipeline)\"",
    "sr_no": 195,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_salesqualifiedlead",
    "label": "Latest time in \"Sales Qualified Lead (Lifecycle Stage Pipeline)\"",
    "sr_no": 196,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_subscriber",
    "label": "Latest time in \"Subscriber (Lifecycle Stage Pipeline)\"",
    "sr_no": 197,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_latest_source",
    "label": "Latest Traffic Source",
    "sr_no": 198,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_latest_source_timestamp",
    "label": "Latest Traffic Source Date",
    "sr_no": 199,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_latest_source_data_1",
    "label": "Latest Traffic Source Drill-Down 1",
    "sr_no": 200,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_latest_source_data_2",
    "label": "Latest Traffic Source Drill-Down 2",
    "sr_no": 201,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_latitude",
    "label": "Latitude",
    "sr_no": 202,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_gps_latitude",
    "label": "Latitudes",
    "sr_no": 203,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_predictivecontactscorebucket",
    "label": "Lead Rating",
    "sr_no": 204,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_time_to_first_engagement",
    "label": "Lead response time",
    "sr_no": 205,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_lead_status",
    "label": "Lead Status",
    "sr_no": 206,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_legal_basis",
    "label": "Legal basis for processing contact's data",
    "sr_no": 207,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "lifecyclestage",
    "label": "Lifecycle Stage",
    "sr_no": 208,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_predictivecontactscore_v2",
    "label": "Likelihood to close",
    "sr_no": 209,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "linkedinbio",
    "label": "LinkedIn Bio",
    "sr_no": 210,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_social_linkedin_clicks",
    "label": "LinkedIn Clicks",
    "sr_no": 211,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "linkedinconnections",
    "label": "LinkedIn Connections",
    "sr_no": 212,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_linkedinid",
    "label": "Linkedin ID",
    "sr_no": 213,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_linkedin_url",
    "label": "LinkedIn URL",
    "sr_no": 214,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_live_enrichment_deadline",
    "label": "Live enrichment deadline",
    "sr_no": 215,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_longitude",
    "label": "Longitude",
    "sr_no": 216,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_gps_longitude",
    "label": "Longitudes",
    "sr_no": 217,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "marital_status",
    "label": "Marital Status",
    "sr_no": 218,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_marketable_status",
    "label": "Marketing contact status",
    "sr_no": 219,
    "type": "enumeration",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_marketable_reason_id",
    "label": "Marketing contact status source name",
    "sr_no": 220,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_marketable_reason_type",
    "label": "Marketing contact status source type",
    "sr_no": 221,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_marketable_until_renewal",
    "label": "Marketing contact until next update",
    "sr_no": 222,
    "type": "enumeration",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_emailconfirmationstatus",
    "label": "Marketing email confirmation status",
    "sr_no": 223,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_email_bounce",
    "label": "Marketing emails bounced",
    "sr_no": 224,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_email_click",
    "label": "Marketing emails clicked",
    "sr_no": 225,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_email_delivered",
    "label": "Marketing emails delivered",
    "sr_no": 226,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_email_open",
    "label": "Marketing emails opened",
    "sr_no": 227,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_email_replied",
    "label": "Marketing emails replied",
    "sr_no": 228,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "engagements_last_meeting_booked_medium",
    "label": "Medium of last booking in meetings tool",
    "sr_no": 229,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_content_membership_email",
    "label": "Member email",
    "sr_no": 230,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_membership_has_accessed_private_content",
    "label": "Member has accessed private content",
    "sr_no": 231,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_membership_last_private_content_access_date",
    "label": "Membership last private content access date",
    "sr_no": 232,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_content_membership_notes",
    "label": "Membership Notes",
    "sr_no": 233,
    "type": "string",
    "fieldType": "textarea"
  },
  {
    "name": "hs_merged_object_ids",
    "label": "Merged Contact IDs",
    "sr_no": 234,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_calculated_merged_vids",
    "label": "Merged vids with timestamps of a contact",
    "sr_no": 235,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "message",
    "label": "Message",
    "sr_no": 236,
    "type": "string",
    "fieldType": "textarea"
  },
  {
    "name": "hs_messaging_engagement_score",
    "label": "messaging_engagement_score",
    "sr_no": 237,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "military_status",
    "label": "Military status",
    "sr_no": 238,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "mobilephone",
    "label": "Mobile Phone Number",
    "sr_no": 239,
    "type": "string",
    "fieldType": "phonenumber"
  },
  {
    "name": "hs_mobile_sdk_push_tokens",
    "label": "Mobile Sdk Push Tokens",
    "sr_no": 240,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_social_last_engagement",
    "label": "Most Recent Social Click",
    "sr_no": 241,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_notes_next_activity",
    "label": "Next Activity",
    "sr_no": 242,
    "type": "object_coordinates",
    "fieldType": "text"
  },
  {
    "name": "notes_next_activity_date",
    "label": "Next Activity Date",
    "sr_no": 243,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_notes_next_activity_type",
    "label": "Next Activity Type",
    "sr_no": 244,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "num_associated_deals",
    "label": "Number of Associated Deals",
    "sr_no": 245,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "numemployees",
    "label": "Number of Employees",
    "sr_no": 246,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_analytics_num_event_completions",
    "label": "Number of event completions",
    "sr_no": 247,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "num_conversion_events",
    "label": "Number of Form Submissions",
    "sr_no": 248,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_analytics_num_page_views",
    "label": "Number of Pageviews",
    "sr_no": 249,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "num_notes",
    "label": "Number of Sales Activities",
    "sr_no": 250,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_sequences_actively_enrolled_count",
    "label": "Number of sequences actively enrolled",
    "sr_no": 251,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_sequences_enrolled_count",
    "label": "Number of sequences enrolled",
    "sr_no": 252,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_analytics_num_visits",
    "label": "Number of Sessions",
    "sr_no": 253,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "num_contacted_notes",
    "label": "Number of times contacted",
    "sr_no": 254,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "num_unique_conversion_events",
    "label": "Number of Unique Forms Submitted",
    "sr_no": 255,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_createdate",
    "label": "Object create date/time",
    "sr_no": 256,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_lastmodifieddate",
    "label": "Object last modified date/time",
    "sr_no": 257,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_email_optout_1106029856",
    "label": "Opted out of email: Customer Service Communication",
    "sr_no": 258,
    "type": "enumeration",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_email_optout_1106029853",
    "label": "Opted out of email: Marketing Information",
    "sr_no": 259,
    "type": "enumeration",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_email_optout_1106029854",
    "label": "Opted out of email: One to One",
    "sr_no": 260,
    "type": "enumeration",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_email_optimal_send_day_of_week",
    "label": "Optimal Marketing Email Send Day of Week",
    "sr_no": 261,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_email_optimal_send_time_of_day",
    "label": "Optimal Marketing Email Send Time of Day ",
    "sr_no": 262,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_source",
    "label": "Original Traffic Source",
    "sr_no": 263,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_analytics_source_data_1",
    "label": "Original Traffic Source Drill-Down 1",
    "sr_no": 264,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_source_data_2",
    "label": "Original Traffic Source Drill-Down 2",
    "sr_no": 265,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hubspot_owner_assigneddate",
    "label": "Owner assigned date",
    "sr_no": 266,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_owning_teams",
    "label": "Owning Teams",
    "sr_no": 267,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_was_imported",
    "label": "Performed in an import",
    "sr_no": 268,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_persona",
    "label": "Persona",
    "sr_no": 269,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "phone",
    "label": "Phone Number",
    "sr_no": 270,
    "type": "string",
    "fieldType": "phonenumber"
  },
  {
    "name": "photo",
    "label": "Photo",
    "sr_no": 271,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_pinned_engagement_id",
    "label": "Pinned engagement ID",
    "sr_no": 272,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_pipeline",
    "label": "Pipeline",
    "sr_no": 273,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "zip",
    "label": "Postal Code",
    "sr_no": 274,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_predictivecontactscore",
    "label": "Predictive Lead Score",
    "sr_no": 275,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_language",
    "label": "Preferred language",
    "sr_no": 276,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "associatedcompanyid",
    "label": "Primary Associated Company ID",
    "sr_no": 277,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_prospecting_agent_actively_enrolled_count",
    "label": "Prospecting Agent Actively Enrolled Count",
    "sr_no": 278,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_prospecting_agent_last_enrolled",
    "label": "Prospecting Agent Last Enrolled",
    "sr_no": 279,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_prospecting_agent_total_enrolled_count",
    "label": "Prospecting Agent Total Enrolled Count",
    "sr_no": 280,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_quarantined_emails",
    "label": "Quarantined Emails",
    "sr_no": 281,
    "type": "string",
    "fieldType": "textarea"
  },
  {
    "name": "hs_read_only",
    "label": "Read only object",
    "sr_no": 282,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_email_optout_survey_reason",
    "label": "Reason for opting out of email",
    "sr_no": 283,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_recent_closed_order_date",
    "label": "Recent Closed Order Date",
    "sr_no": 284,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "recent_conversion_event_name",
    "label": "Recent Conversion",
    "sr_no": 285,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "recent_conversion_date",
    "label": "Recent Conversion Date",
    "sr_no": 286,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "recent_deal_amount",
    "label": "Recent Deal Amount",
    "sr_no": 287,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "recent_deal_close_date",
    "label": "Recent Deal Close Date",
    "sr_no": 288,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_document_last_revisited",
    "label": "Recent Document Revisit Date",
    "sr_no": 289,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_sales_email_last_clicked",
    "label": "Recent Sales Email Clicked Date",
    "sr_no": 290,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_sales_email_last_opened",
    "label": "Recent Sales Email Opened Date",
    "sr_no": 291,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_sales_email_last_replied",
    "label": "Recent Sales Email Replied Date",
    "sr_no": 292,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_object_source",
    "label": "Record creation source",
    "sr_no": 293,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_id",
    "label": "Record creation source ID",
    "sr_no": 294,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_user_id",
    "label": "Record creation source user ID",
    "sr_no": 295,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_object_id",
    "label": "Record ID",
    "sr_no": 296,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_object_source_label",
    "label": "Record source",
    "sr_no": 297,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_object_source_detail_1",
    "label": "Record source detail 1",
    "sr_no": 298,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_detail_2",
    "label": "Record source detail 2",
    "sr_no": 299,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_detail_3",
    "label": "Record source detail 3",
    "sr_no": 300,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_content_membership_registered_at",
    "label": "Registered At",
    "sr_no": 301,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_registered_member",
    "label": "Registered member",
    "sr_no": 302,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_registration_method",
    "label": "Registration Method",
    "sr_no": 303,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "relationship_status",
    "label": "Relationship Status",
    "sr_no": 304,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_returning_to_office_detected_date",
    "label": "Returning to office detected date",
    "sr_no": 305,
    "type": "date",
    "fieldType": "date"
  },
  {
    "name": "salutation",
    "label": "Salutation",
    "sr_no": 306,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "school",
    "label": "School",
    "sr_no": 307,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_email_sends_since_last_engagement",
    "label": "Sends Since Last Engagement",
    "sr_no": 308,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "seniority",
    "label": "Seniority",
    "sr_no": 309,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_shared_team_ids",
    "label": "Shared teams",
    "sr_no": 310,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_shared_user_ids",
    "label": "Shared users",
    "sr_no": 311,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_feedback_show_nps_web_survey",
    "label": "Should be shown an NPS web survey",
    "sr_no": 312,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_source_object_id",
    "label": "Source Object ID",
    "sr_no": 313,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "engagements_last_meeting_booked_source",
    "label": "Source of last booking in meetings tool",
    "sr_no": 314,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_source_portal_id",
    "label": "Source Portal ID",
    "sr_no": 315,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "start_date",
    "label": "Start date",
    "sr_no": 316,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "state",
    "label": "State/Region",
    "sr_no": 317,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_state_code",
    "label": "State/Region Code",
    "sr_no": 318,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_content_membership_status",
    "label": "Status",
    "sr_no": 319,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "address",
    "label": "Street Address",
    "sr_no": 320,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "surveymonkeyeventlastupdated",
    "label": "SurveyMonkey Event Last Updated",
    "sr_no": 321,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_testpurge",
    "label": "testpurge",
    "sr_no": 322,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_testrollback",
    "label": "testrollback",
    "sr_no": 323,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_calculated_form_submissions",
    "label": "The 800 most recent form submissions for a contact",
    "sr_no": 324,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_time_between_contact_creation_and_deal_close",
    "label": "Time between contact creation and deal close",
    "sr_no": 325,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_time_between_contact_creation_and_deal_creation",
    "label": "Time between contact creation and deal creation",
    "sr_no": 326,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_content_membership_follow_up_enqueued_at",
    "label": "Time enrolled in registration follow up emails",
    "sr_no": 327,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_analytics_first_timestamp",
    "label": "Time First Seen",
    "sr_no": 328,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_analytics_last_timestamp",
    "label": "Time Last Seen",
    "sr_no": 329,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_analytics_first_visit_timestamp",
    "label": "Time of First Session",
    "sr_no": 330,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_analytics_last_visit_timestamp",
    "label": "Time of Last Session",
    "sr_no": 331,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_content_membership_registration_email_sent_at",
    "label": "Time registration email was sent",
    "sr_no": 332,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_time_to_move_from_lead_to_customer",
    "label": "Time to move from lead to customer",
    "sr_no": 333,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_time_to_move_from_marketingqualifiedlead_to_customer",
    "label": "Time to move from marketing qualified lead to customer",
    "sr_no": 334,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_time_to_move_from_opportunity_to_customer",
    "label": "Time to move from opportunity to customer",
    "sr_no": 335,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_time_to_move_from_salesqualifiedlead_to_customer",
    "label": "Time to move from sales qualified lead to customer",
    "sr_no": 336,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_time_to_move_from_subscriber_to_customer",
    "label": "Time to move from subscriber to customer",
    "sr_no": 337,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_timezone",
    "label": "Time Zone",
    "sr_no": 338,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "total_revenue",
    "label": "Total Revenue",
    "sr_no": 339,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "twitterbio",
    "label": "Twitter Bio",
    "sr_no": 340,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_social_twitter_clicks",
    "label": "Twitter Clicks",
    "sr_no": 341,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_twitterid",
    "label": "Twitter ID",
    "sr_no": 342,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "twitterprofilephoto",
    "label": "Twitter Profile Photo",
    "sr_no": 343,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "twitterhandle",
    "label": "Twitter Username",
    "sr_no": 344,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_sa_first_engagement_object_type",
    "label": "Type of first engagement",
    "sr_no": 345,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_unique_creation_key",
    "label": "Unique creation key",
    "sr_no": 346,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_email_optout",
    "label": "Unsubscribed from all email",
    "sr_no": 347,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_updated_by_user_id",
    "label": "Updated by user ID",
    "sr_no": 348,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_user_ids_of_all_notification_followers",
    "label": "User IDs of all notification followers",
    "sr_no": 349,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_user_ids_of_all_notification_unfollowers",
    "label": "User IDs of all notification unfollowers",
    "sr_no": 350,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_user_ids_of_all_owners",
    "label": "User IDs of all owners",
    "sr_no": 351,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "webinareventlastupdated",
    "label": "Webinar Event Last Updated",
    "sr_no": 352,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "website",
    "label": "Website URL",
    "sr_no": 353,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_whatsapp_phone_number",
    "label": "WhatsApp Phone Number",
    "sr_no": 354,
    "type": "string",
    "fieldType": "phonenumber"
  },
  {
    "name": "work_email",
    "label": "Work email",
    "sr_no": 355,
    "type": "string",
    "fieldType": "text"
  }
];

// ==========================================
// COMPANY PROPERTIES (198 properties)
// ==========================================
// These are default HubSpot company fields like name, domain, industry, etc.
export const hubspotCompanyProperties: HubSpotDefaultProperty[] = [
  {
    "name": "about_us",
    "label": "About Us",
    "sr_no": 1,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_additional_domains",
    "label": "Additional Domains",
    "sr_no": 2,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_all_owner_ids",
    "label": "All owner IDs",
    "sr_no": 3,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_all_team_ids",
    "label": "All team IDs",
    "sr_no": 4,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_all_accessible_team_ids",
    "label": "All teams",
    "sr_no": 5,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "annualrevenue",
    "label": "Annual Revenue",
    "sr_no": 6,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_annual_revenue_currency_code",
    "label": "Annual Revenue Currency Code",
    "sr_no": 7,
    "type": "string",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_avatar_filemanager_key",
    "label": "Avatar FileManager key",
    "sr_no": 8,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_all_assigned_business_unit_ids",
    "label": "Brands",
    "sr_no": 9,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "engagements_last_meeting_booked_campaign",
    "label": "Campaign of last booking in meetings tool",
    "sr_no": 10,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "city",
    "label": "City",
    "sr_no": 11,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "closedate",
    "label": "Close Date",
    "sr_no": 12,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "domain",
    "label": "Company Domain Name",
    "sr_no": 13,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_keywords",
    "label": "Company Keywords",
    "sr_no": 14,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "name",
    "label": "Company name",
    "sr_no": 15,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hubspot_owner_id",
    "label": "Company owner",
    "sr_no": 16,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hubspot_owner_id",
    "label": "Company owner",
    "sr_no": 17,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_task_label",
    "label": "Company task label",
    "sr_no": 18,
    "type": "string",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_task_label",
    "label": "Company task label",
    "sr_no": 19,
    "type": "string",
    "fieldType": "calculation_equation"
  },
  {
    "name": "country",
    "label": "Country/Region",
    "sr_no": 20,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_country_code",
    "label": "Country/Region Code",
    "sr_no": 21,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "createdate",
    "label": "Create Date",
    "sr_no": 22,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_created_by_user_id",
    "label": "Created by user ID",
    "sr_no": 23,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_csm_sentiment",
    "label": "CSM Sentiment",
    "sr_no": 24,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_date_entered_customer",
    "label": "Date entered 'Customer (Lifecycle Stage Pipeline)'",
    "sr_no": 25,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_entered_evangelist",
    "label": "Date entered 'Evangelist (Lifecycle Stage Pipeline)'",
    "sr_no": 26,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_entered_lead",
    "label": "Date entered 'Lead (Lifecycle Stage Pipeline)'",
    "sr_no": 27,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_entered_marketingqualifiedlead",
    "label": "Date entered 'Marketing Qualified Lead (Lifecycle Stage Pipeline)'",
    "sr_no": 28,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_entered_opportunity",
    "label": "Date entered 'Opportunity (Lifecycle Stage Pipeline)'",
    "sr_no": 29,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_entered_other",
    "label": "Date entered 'Other (Lifecycle Stage Pipeline)'",
    "sr_no": 30,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_entered_salesqualifiedlead",
    "label": "Date entered 'Sales Qualified Lead (Lifecycle Stage Pipeline)'",
    "sr_no": 31,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_entered_subscriber",
    "label": "Date entered 'Subscriber (Lifecycle Stage Pipeline)'",
    "sr_no": 32,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_exited_customer",
    "label": "Date exited 'Customer (Lifecycle Stage Pipeline)'",
    "sr_no": 33,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_exited_evangelist",
    "label": "Date exited 'Evangelist (Lifecycle Stage Pipeline)'",
    "sr_no": 34,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_exited_lead",
    "label": "Date exited 'Lead (Lifecycle Stage Pipeline)'",
    "sr_no": 35,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_exited_marketingqualifiedlead",
    "label": "Date exited 'Marketing Qualified Lead (Lifecycle Stage Pipeline)'",
    "sr_no": 36,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_exited_opportunity",
    "label": "Date exited 'Opportunity (Lifecycle Stage Pipeline)'",
    "sr_no": 37,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_exited_other",
    "label": "Date exited 'Other (Lifecycle Stage Pipeline)'",
    "sr_no": 38,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_exited_salesqualifiedlead",
    "label": "Date exited 'Sales Qualified Lead (Lifecycle Stage Pipeline)'",
    "sr_no": 39,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_exited_subscriber",
    "label": "Date exited 'Subscriber (Lifecycle Stage Pipeline)'",
    "sr_no": 40,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "engagements_last_meeting_booked",
    "label": "Date of last meeting booked in meetings tool",
    "sr_no": 41,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "days_to_close",
    "label": "Days to Close",
    "sr_no": 42,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "description",
    "label": "Description",
    "sr_no": 43,
    "type": "string",
    "fieldType": "textarea"
  },
  {
    "name": "hs_employee_range",
    "label": "Employee range",
    "sr_no": 44,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "facebook_company_page",
    "label": "Facebook Company Page",
    "sr_no": 45,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "facebookfans",
    "label": "Facebook Fans",
    "sr_no": 46,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "first_contact_createdate",
    "label": "First Contact Create Date",
    "sr_no": 47,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "first_conversion_event_name",
    "label": "First Conversion",
    "sr_no": 48,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "first_conversion_date",
    "label": "First Conversion Date",
    "sr_no": 49,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "first_deal_created_date",
    "label": "First Deal Created Date",
    "sr_no": 50,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_analytics_first_touch_converting_campaign",
    "label": "First Touch Converting Campaign",
    "sr_no": 51,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "googleplus_page",
    "label": "Google Plus Page",
    "sr_no": 52,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_gps_error",
    "label": "GPS Error",
    "sr_no": 53,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_is_enriched",
    "label": "Has been enriched",
    "sr_no": 54,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "owneremail",
    "label": "HubSpot Owner Email",
    "sr_no": 55,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "ownername",
    "label": "HubSpot Owner Name",
    "sr_no": 56,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hubspotscore",
    "label": "HubSpot Score",
    "sr_no": 57,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hubspot_team_id",
    "label": "HubSpot Team",
    "sr_no": 58,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_ideal_customer_profile",
    "label": "Ideal Customer Profile Tier",
    "sr_no": 59,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "industry",
    "label": "Industry",
    "sr_no": 60,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_industry_group",
    "label": "Industry group",
    "sr_no": 61,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_intent_paid_up_to_date",
    "label": "Intent paid up to date",
    "sr_no": 62,
    "type": "date",
    "fieldType": "date"
  },
  {
    "name": "hs_intent_signals_enabled",
    "label": "Intent Signals active",
    "sr_no": 63,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_is_intent_monitored",
    "label": "Is Intent Monitored",
    "sr_no": 64,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "is_public",
    "label": "Is Public",
    "sr_no": 65,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_notes_last_activity",
    "label": "Last Activity",
    "sr_no": 66,
    "type": "object_coordinates",
    "fieldType": "text"
  },
  {
    "name": "notes_last_updated",
    "label": "Last Activity Date",
    "sr_no": 67,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_booked_meeting_date",
    "label": "Last Booked Meeting Date",
    "sr_no": 68,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "notes_last_contacted",
    "label": "Last Contacted",
    "sr_no": 69,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_sales_activity_timestamp",
    "label": "Last Engagement Date",
    "sr_no": 70,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_sales_activity_type",
    "label": "Last Engagement Type",
    "sr_no": 71,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_last_logged_call_date",
    "label": "Last Logged Call Date",
    "sr_no": 72,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_logged_outgoing_email_date",
    "label": "Last Logged Outgoing Email Date",
    "sr_no": 73,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_last_metered_enrichment_timestamp",
    "label": "Last Metered Enrichment Timestamp",
    "sr_no": 74,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_lastmodifieddate",
    "label": "Last Modified Date",
    "sr_no": 75,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_open_task_date",
    "label": "Last Open Task Date",
    "sr_no": 76,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_sales_activity_date",
    "label": "last sales activity date old",
    "sr_no": 77,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_analytics_last_touch_converting_campaign",
    "label": "Last Touch Converting Campaign",
    "sr_no": 78,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_most_recent_de_anonymized_visit",
    "label": "Last Tracked Visit Time",
    "sr_no": 79,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_latest_createdate_of_active_subscriptions",
    "label": "Latest create date of active subscriptions",
    "sr_no": 80,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_meeting_activity",
    "label": "Latest meeting activity",
    "sr_no": 81,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_analytics_latest_source",
    "label": "Latest Traffic Source",
    "sr_no": 82,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_analytics_latest_source_data_1",
    "label": "Latest Traffic Source Data 1",
    "sr_no": 83,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_latest_source_data_2",
    "label": "Latest Traffic Source Data 2",
    "sr_no": 84,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_latest_source_timestamp",
    "label": "Latest Traffic Source Timestamp",
    "sr_no": 85,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_latitude",
    "label": "Latitude",
    "sr_no": 86,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_gps_latitude",
    "label": "Latitudes",
    "sr_no": 87,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_lead_status",
    "label": "Lead Status",
    "sr_no": 88,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "lifecyclestage",
    "label": "Lifecycle Stage",
    "sr_no": 89,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_predictivecontactscore_v2",
    "label": "Likelihood to close",
    "sr_no": 90,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "linkedinbio",
    "label": "LinkedIn Bio",
    "sr_no": 91,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "linkedin_company_page",
    "label": "LinkedIn Company Page",
    "sr_no": 92,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_linkedin_handle",
    "label": "Linkedin handle",
    "sr_no": 93,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_live_enrichment_deadline",
    "label": "Live enrichment deadline",
    "sr_no": 94,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_logo_url",
    "label": "Logo URL",
    "sr_no": 95,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_longitude",
    "label": "Longitude",
    "sr_no": 96,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_gps_longitude",
    "label": "Longitudes",
    "sr_no": 97,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "engagements_last_meeting_booked_medium",
    "label": "Medium of last booking in meetings tool",
    "sr_no": 98,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_merged_object_ids",
    "label": "Merged Company IDs",
    "sr_no": 99,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_notes_next_activity",
    "label": "Next Activity",
    "sr_no": 100,
    "type": "object_coordinates",
    "fieldType": "text"
  },
  {
    "name": "notes_next_activity_date",
    "label": "Next Activity Date",
    "sr_no": 101,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_notes_next_activity_type",
    "label": "Next Activity Type",
    "sr_no": 102,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "num_associated_contacts",
    "label": "Number of Associated Contacts",
    "sr_no": 103,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "num_associated_deals",
    "label": "Number of Associated Deals",
    "sr_no": 104,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_num_blockers",
    "label": "Number of blockers",
    "sr_no": 105,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_num_child_companies",
    "label": "Number of child companies",
    "sr_no": 106,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_num_contacts_with_buying_roles",
    "label": "Number of contacts with a buying role",
    "sr_no": 107,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_num_decision_makers",
    "label": "Number of decision makers",
    "sr_no": 108,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "numberofemployees",
    "label": "Number of Employees",
    "sr_no": 109,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "num_conversion_events",
    "label": "Number of Form Submissions",
    "sr_no": 110,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_num_open_deals",
    "label": "Number of open deals",
    "sr_no": 111,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_analytics_num_page_views",
    "label": "Number of Pageviews",
    "sr_no": 112,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "num_notes",
    "label": "Number of Sales Activities",
    "sr_no": 113,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_analytics_num_visits",
    "label": "Number of Sessions",
    "sr_no": 114,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "num_contacted_notes",
    "label": "Number of times contacted",
    "sr_no": 115,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_analytics_source",
    "label": "Original Traffic Source",
    "sr_no": 116,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_analytics_source_data_1",
    "label": "Original Traffic Source Drill-Down 1",
    "sr_no": 117,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_source_data_2",
    "label": "Original Traffic Source Drill-Down 2",
    "sr_no": 118,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hubspot_owner_assigneddate",
    "label": "Owner assigned date",
    "sr_no": 119,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_owning_teams",
    "label": "Owning Teams",
    "sr_no": 120,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_parent_company_id",
    "label": "Parent Company",
    "sr_no": 121,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_was_imported",
    "label": "Performed in an import",
    "sr_no": 122,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "phone",
    "label": "Phone Number",
    "sr_no": 123,
    "type": "string",
    "fieldType": "phonenumber"
  },
  {
    "name": "hs_pinned_engagement_id",
    "label": "Pinned Engagement ID",
    "sr_no": 124,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_pipeline",
    "label": "Pipeline",
    "sr_no": 125,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "zip",
    "label": "Postal Code",
    "sr_no": 126,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_quick_context",
    "label": "Quick context",
    "sr_no": 127,
    "type": "string",
    "fieldType": "html"
  },
  {
    "name": "hs_read_only",
    "label": "Read only object",
    "sr_no": 128,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "recent_conversion_event_name",
    "label": "Recent Conversion",
    "sr_no": 129,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "recent_conversion_date",
    "label": "Recent Conversion Date",
    "sr_no": 130,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "recent_deal_amount",
    "label": "Recent Deal Amount",
    "sr_no": 131,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "recent_deal_close_date",
    "label": "Recent Deal Close Date",
    "sr_no": 132,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_sales_email_last_replied",
    "label": "Recent Sales Email Replied Date",
    "sr_no": 133,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_object_source",
    "label": "Record creation source",
    "sr_no": 134,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_id",
    "label": "Record creation source ID",
    "sr_no": 135,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_user_id",
    "label": "Record creation source user ID",
    "sr_no": 136,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_object_id",
    "label": "Record ID",
    "sr_no": 137,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_object_source_label",
    "label": "Record source",
    "sr_no": 138,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_object_source_detail_1",
    "label": "Record source detail 1",
    "sr_no": 139,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_detail_2",
    "label": "Record source detail 2",
    "sr_no": 140,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_detail_3",
    "label": "Record source detail 3",
    "sr_no": 141,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_research_agent_execution_id",
    "label": "Research Agent Execution Id",
    "sr_no": 142,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_research_agent_id",
    "label": "Research Agent Id",
    "sr_no": 143,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_revenue_range",
    "label": "Revenue range",
    "sr_no": 144,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_shared_team_ids",
    "label": "Shared teams",
    "sr_no": 145,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_shared_user_ids",
    "label": "Shared users",
    "sr_no": 146,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_signals_summary",
    "label": "Signals Summary",
    "sr_no": 147,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_source_object_id",
    "label": "Source Object ID",
    "sr_no": 148,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "engagements_last_meeting_booked_source",
    "label": "Source of last booking in meetings tool",
    "sr_no": 149,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "state",
    "label": "State/Region",
    "sr_no": 150,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_state_code",
    "label": "State/Region Code",
    "sr_no": 151,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_is_target_account",
    "label": "Target Account",
    "sr_no": 152,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_target_account",
    "label": "Target Account",
    "sr_no": 153,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_target_account_probability",
    "label": "Target Account Probability",
    "sr_no": 154,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_target_account_recommendation_snooze_time",
    "label": "Target Account Recommendation Snooze Time",
    "sr_no": 155,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_target_account_recommendation_state",
    "label": "Target Account Recommendation State",
    "sr_no": 156,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_analytics_first_timestamp",
    "label": "Time First Seen",
    "sr_no": 157,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_time_in_customer",
    "label": "Time in 'Customer (Lifecycle Stage Pipeline)'",
    "sr_no": 158,
    "type": "number",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_time_in_evangelist",
    "label": "Time in 'Evangelist (Lifecycle Stage Pipeline)'",
    "sr_no": 159,
    "type": "number",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_time_in_lead",
    "label": "Time in 'Lead (Lifecycle Stage Pipeline)'",
    "sr_no": 160,
    "type": "number",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_time_in_marketingqualifiedlead",
    "label": "Time in 'Marketing Qualified Lead (Lifecycle Stage Pipeline)'",
    "sr_no": 161,
    "type": "number",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_time_in_opportunity",
    "label": "Time in 'Opportunity (Lifecycle Stage Pipeline)'",
    "sr_no": 162,
    "type": "number",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_time_in_other",
    "label": "Time in 'Other (Lifecycle Stage Pipeline)'",
    "sr_no": 163,
    "type": "number",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_time_in_salesqualifiedlead",
    "label": "Time in 'Sales Qualified Lead (Lifecycle Stage Pipeline)'",
    "sr_no": 164,
    "type": "number",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_time_in_subscriber",
    "label": "Time in 'Subscriber (Lifecycle Stage Pipeline)'",
    "sr_no": 165,
    "type": "number",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_analytics_last_timestamp",
    "label": "Time Last Seen",
    "sr_no": 166,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_analytics_first_visit_timestamp",
    "label": "Time of First Session",
    "sr_no": 167,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_analytics_last_visit_timestamp",
    "label": "Time of Last Session",
    "sr_no": 168,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "timezone",
    "label": "Time Zone",
    "sr_no": 169,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "total_money_raised",
    "label": "Total Money Raised",
    "sr_no": 170,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_total_deal_value",
    "label": "Total open deal value",
    "sr_no": 171,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "total_revenue",
    "label": "Total Revenue",
    "sr_no": 172,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_intent_page_views_last_30_days",
    "label": "Tracked Page Views (Last 30 Days)",
    "sr_no": 173,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_intent_visitors_last_30_days",
    "label": "Tracked Visitors (Last 30 Days)",
    "sr_no": 174,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "twitterbio",
    "label": "Twitter Bio",
    "sr_no": 175,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "twitterfollowers",
    "label": "Twitter Followers",
    "sr_no": 176,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "twitterhandle",
    "label": "Twitter Handle",
    "sr_no": 177,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "type",
    "label": "Type",
    "sr_no": 178,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_unique_creation_key",
    "label": "Unique creation key",
    "sr_no": 179,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_updated_by_user_id",
    "label": "Updated by user ID",
    "sr_no": 180,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_user_ids_of_all_notification_followers",
    "label": "User IDs of all notification followers",
    "sr_no": 181,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_user_ids_of_all_notification_unfollowers",
    "label": "User IDs of all notification unfollowers",
    "sr_no": 182,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_user_ids_of_all_owners",
    "label": "User IDs of all owners",
    "sr_no": 183,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "web_technologies",
    "label": "Web Technologies",
    "sr_no": 184,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "website",
    "label": "Website URL",
    "sr_no": 185,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "founded_year",
    "label": "Year Founded",
    "sr_no": 186,
    "type": "string",
    "fieldType": "text"
  }
];

// ==========================================
// DEAL PROPERTIES (190 properties)
// ==========================================
// These are default HubSpot deal fields like amount, dealname, closedate, etc.
export const hubspotDealProperties: HubSpotDefaultProperty[] = [
  {
    "name": "hs_actual_duration",
    "label": "Acutal duration",
    "sr_no": 1,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_all_owner_ids",
    "label": "All owner IDs",
    "sr_no": 2,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_all_team_ids",
    "label": "All team IDs",
    "sr_no": 3,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_all_accessible_team_ids",
    "label": "All teams",
    "sr_no": 4,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "amount",
    "label": "Amount",
    "sr_no": 5,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "amount_in_home_currency",
    "label": "Amount in company currency",
    "sr_no": 6,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_acv",
    "label": "Annual contract value",
    "sr_no": 7,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_arr",
    "label": "Annual recurring revenue",
    "sr_no": 8,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_associated_deal_registration_product_interests",
    "label": "Associated Shared Deal Product Interests",
    "sr_no": 9,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_associated_deal_registration_deal_type",
    "label": "Associated Shared Deal Type",
    "sr_no": 10,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_attributed_team_ids",
    "label": "Attributed reporting team",
    "sr_no": 11,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_average_call_duration",
    "label": "Average call duration",
    "sr_no": 12,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_average_deal_owner_duration_in_current_stage",
    "label": "Average Deal Owner Duration In Current Stage",
    "sr_no": 13,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_all_assigned_business_unit_ids",
    "label": "Brands",
    "sr_no": 14,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "engagements_last_meeting_booked_campaign",
    "label": "Campaign of last booking in meetings tool",
    "sr_no": 15,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "closedate",
    "label": "Close Date",
    "sr_no": 16,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_closed_amount",
    "label": "Closed Deal Amount",
    "sr_no": 17,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_closed_amount_in_home_currency",
    "label": "Closed deal amount in home currency",
    "sr_no": 18,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_closed_deal_close_date",
    "label": "Closed Deal Close Date",
    "sr_no": 19,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_closed_deal_create_date",
    "label": "Closed Deal Create Date",
    "sr_no": 20,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "closed_lost_reason",
    "label": "Closed Lost Reason",
    "sr_no": 21,
    "type": "string",
    "fieldType": "textarea"
  },
  {
    "name": "hs_closed_won_count",
    "label": "Closed won count",
    "sr_no": 22,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_closed_won_date",
    "label": "Closed Won Date (Internal)",
    "sr_no": 23,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "closed_won_reason",
    "label": "Closed Won Reason",
    "sr_no": 24,
    "type": "string",
    "fieldType": "textarea"
  },
  {
    "name": "createdate",
    "label": "Create Date",
    "sr_no": 25,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_created_by_user_id",
    "label": "Created by user ID",
    "sr_no": 26,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_appointmentscheduled",
    "label": "Cumulative time in \"Appointment Scheduled (Sales Pipeline)\"",
    "sr_no": 27,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_closedlost",
    "label": "Cumulative time in \"Closed Lost (Sales Pipeline)\"",
    "sr_no": 28,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_closedwon",
    "label": "Cumulative time in \"Closed Won (Sales Pipeline)\"",
    "sr_no": 29,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_contractsent",
    "label": "Cumulative time in \"Contract Sent (Sales Pipeline)\"",
    "sr_no": 30,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_decisionmakerboughtin",
    "label": "Cumulative time in \"Decision Maker Bought-In (Sales Pipeline)\"",
    "sr_no": 31,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_presentationscheduled",
    "label": "Cumulative time in \"Presentation Scheduled (Sales Pipeline)\"",
    "sr_no": 32,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_qualifiedtobuy",
    "label": "Cumulative time in \"Qualified To Buy (Sales Pipeline)\"",
    "sr_no": 33,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "deal_currency_code",
    "label": "Currency",
    "sr_no": 34,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_v2_date_entered_appointmentscheduled",
    "label": "Date entered \"Appointment Scheduled (Sales Pipeline)\"",
    "sr_no": 35,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_closedlost",
    "label": "Date entered \"Closed Lost (Sales Pipeline)\"",
    "sr_no": 36,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_closedwon",
    "label": "Date entered \"Closed Won (Sales Pipeline)\"",
    "sr_no": 37,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_contractsent",
    "label": "Date entered \"Contract Sent (Sales Pipeline)\"",
    "sr_no": 38,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_decisionmakerboughtin",
    "label": "Date entered \"Decision Maker Bought-In (Sales Pipeline)\"",
    "sr_no": 39,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_presentationscheduled",
    "label": "Date entered \"Presentation Scheduled (Sales Pipeline)\"",
    "sr_no": 40,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_qualifiedtobuy",
    "label": "Date entered \"Qualified To Buy (Sales Pipeline)\"",
    "sr_no": 41,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_current_stage",
    "label": "Date entered current stage",
    "sr_no": 42,
    "type": "datetime",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_v2_date_exited_appointmentscheduled",
    "label": "Date exited \"Appointment Scheduled (Sales Pipeline)\"",
    "sr_no": 43,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_closedlost",
    "label": "Date exited \"Closed Lost (Sales Pipeline)\"",
    "sr_no": 44,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_closedwon",
    "label": "Date exited \"Closed Won (Sales Pipeline)\"",
    "sr_no": 45,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_contractsent",
    "label": "Date exited \"Contract Sent (Sales Pipeline)\"",
    "sr_no": 46,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_decisionmakerboughtin",
    "label": "Date exited \"Decision Maker Bought-In (Sales Pipeline)\"",
    "sr_no": 47,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_presentationscheduled",
    "label": "Date exited \"Presentation Scheduled (Sales Pipeline)\"",
    "sr_no": 48,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_qualifiedtobuy",
    "label": "Date exited \"Qualified To Buy (Sales Pipeline)\"",
    "sr_no": 49,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "engagements_last_meeting_booked",
    "label": "Date of last meeting booked in meetings tool",
    "sr_no": 50,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "days_to_close",
    "label": "Days to close",
    "sr_no": 51,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_days_to_close_raw",
    "label": "Days to close (without rounding)",
    "sr_no": 52,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_deal_amount_calculation_preference",
    "label": "Deal amount calculation preference",
    "sr_no": 53,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_all_collaborator_owner_ids",
    "label": "Deal Collaborator",
    "sr_no": 54,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "description",
    "label": "Deal Description",
    "sr_no": 55,
    "type": "string",
    "fieldType": "textarea"
  },
  {
    "name": "dealname",
    "label": "Deal Name",
    "sr_no": 56,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hubspot_owner_id",
    "label": "Deal owner",
    "sr_no": 57,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_deal_stage_probability",
    "label": "Deal probability",
    "sr_no": 58,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_deal_score",
    "label": "Deal Score",
    "sr_no": 59,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_is_deal_split",
    "label": "Deal Split Added",
    "sr_no": 60,
    "type": "bool",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_all_deal_split_owner_ids",
    "label": "Deal Split Users",
    "sr_no": 61,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "dealstage",
    "label": "Deal Stage",
    "sr_no": 62,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_deal_stage_probability_shadow",
    "label": "Deal stage probability shadow",
    "sr_no": 63,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_tag_ids",
    "label": "Deal Tags",
    "sr_no": 64,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "dealtype",
    "label": "Deal Type",
    "sr_no": 65,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_duration",
    "label": "Duration",
    "sr_no": 66,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_exchange_rate",
    "label": "Exchange rate",
    "sr_no": 67,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_forecast_amount",
    "label": "Forecast amount",
    "sr_no": 68,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_manual_forecast_category",
    "label": "Forecast category",
    "sr_no": 69,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_forecast_probability",
    "label": "Forecast probability",
    "sr_no": 70,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_line_item_global_term_hs_discount_percentage",
    "label": "Global Term Line Item Discount Percentage",
    "sr_no": 71,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_line_item_global_term_hs_discount_percentage_enabled",
    "label": "Global Term Line Item Discount Percentage Enabled",
    "sr_no": 72,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_line_item_global_term_recurringbillingfrequency",
    "label": "Global Term Line Item Recurring Billing Frequency",
    "sr_no": 73,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_line_item_global_term_recurringbillingfrequency_enabled",
    "label": "Global Term Line Item Recurring Billing Frequency Enabled",
    "sr_no": 74,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_line_item_global_term_hs_recurring_billing_period",
    "label": "Global Term Line Item Recurring Billing Period",
    "sr_no": 75,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_line_item_global_term_hs_recurring_billing_period_enabled",
    "label": "Global Term Line Item Recurring Billing Period Enabled",
    "sr_no": 76,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_line_item_global_term_hs_recurring_billing_start_date",
    "label": "Global Term Line Item Recurring Billing Start Date",
    "sr_no": 77,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_line_item_global_term_hs_recurring_billing_start_date_enabled",
    "label": "Global Term Line Item Recurring Billing Start Date Enabled",
    "sr_no": 78,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_has_empty_conditional_stage_properties",
    "label": "Has Empty Conditional Stage Properties",
    "sr_no": 79,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_campaign",
    "label": "HubSpot Campaign",
    "sr_no": 80,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_createdate",
    "label": "HubSpot Create Date",
    "sr_no": 81,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_synced_deal_owner_name_and_email",
    "label": "HubSpot Sales Lead",
    "sr_no": 82,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_deal_registration_mrr",
    "label": "HubSpot Shared Deal MRR",
    "sr_no": 83,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_deal_registration_mrr_currency_code",
    "label": "HubSpot Shared Deal MRR Currency Code",
    "sr_no": 84,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hubspot_team_id",
    "label": "HubSpot Team",
    "sr_no": 85,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_is_active_shared_deal",
    "label": "Is Active Shared Deal",
    "sr_no": 86,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_is_closed_count",
    "label": "Is Closed (numeric)",
    "sr_no": 87,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_is_closed_lost",
    "label": "Is closed lost",
    "sr_no": 88,
    "type": "bool",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_is_closed_won",
    "label": "Is Closed Won",
    "sr_no": 89,
    "type": "bool",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_is_closed",
    "label": "Is Deal Closed?",
    "sr_no": 90,
    "type": "bool",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_is_in_first_deal_stage",
    "label": "Is In First Deal Stage",
    "sr_no": 91,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_is_open_count",
    "label": "Is Open (numeric)",
    "sr_no": 92,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_is_stalled",
    "label": "Is Stalled",
    "sr_no": 93,
    "type": "bool",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_is_stalled_after_timestamp",
    "label": "Is Stalled After Timestamp",
    "sr_no": 94,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_notes_last_activity",
    "label": "Last Activity",
    "sr_no": 95,
    "type": "object_coordinates",
    "fieldType": "text"
  },
  {
    "name": "notes_last_updated",
    "label": "Last Activity Date",
    "sr_no": 96,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "notes_last_contacted",
    "label": "Last Contacted",
    "sr_no": 97,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_lastmodifieddate",
    "label": "Last Modified Date",
    "sr_no": 98,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_latest_approval_status",
    "label": "Latest Approval Status",
    "sr_no": 99,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_latest_approval_status_approval_id",
    "label": "Latest Approval Status Approval ID",
    "sr_no": 100,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_latest_marketing_email_click_date",
    "label": "Latest marketing email click date",
    "sr_no": 101,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_marketing_email_open_date",
    "label": "Latest marketing email open date",
    "sr_no": 102,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_marketing_email_reply_date",
    "label": "Latest marketing email reply date",
    "sr_no": 103,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_meeting_activity",
    "label": "Latest meeting activity",
    "sr_no": 104,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_latest_sales_email_click_date",
    "label": "Latest sales email click date",
    "sr_no": 105,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_sales_email_open_date",
    "label": "Latest sales email open date",
    "sr_no": 106,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_sales_email_reply_date",
    "label": "Latest sales email reply date",
    "sr_no": 107,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_v2_latest_time_in_appointmentscheduled",
    "label": "Latest time in \"Appointment Scheduled (Sales Pipeline)\"",
    "sr_no": 108,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_closedlost",
    "label": "Latest time in \"Closed Lost (Sales Pipeline)\"",
    "sr_no": 109,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_closedwon",
    "label": "Latest time in \"Closed Won (Sales Pipeline)\"",
    "sr_no": 110,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_contractsent",
    "label": "Latest time in \"Contract Sent (Sales Pipeline)\"",
    "sr_no": 111,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_decisionmakerboughtin",
    "label": "Latest time in \"Decision Maker Bought-In (Sales Pipeline)\"",
    "sr_no": 112,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_presentationscheduled",
    "label": "Latest time in \"Presentation Scheduled (Sales Pipeline)\"",
    "sr_no": 113,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_qualifiedtobuy",
    "label": "Latest time in \"Qualified To Buy (Sales Pipeline)\"",
    "sr_no": 114,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_analytics_latest_source",
    "label": "Latest Traffic Source",
    "sr_no": 115,
    "type": "enumeration",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_analytics_latest_source_company",
    "label": "Latest Traffic Source Company",
    "sr_no": 116,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_analytics_latest_source_contact",
    "label": "Latest Traffic Source Contact",
    "sr_no": 117,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_analytics_latest_source_data_1",
    "label": "Latest Traffic Source Data 1",
    "sr_no": 118,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_latest_source_data_1_company",
    "label": "Latest Traffic Source Data 1 Company",
    "sr_no": 119,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_latest_source_data_1_contact",
    "label": "Latest Traffic Source Data 1 Contact",
    "sr_no": 120,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_latest_source_data_2",
    "label": "Latest Traffic Source Data 2",
    "sr_no": 121,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_latest_source_data_2_company",
    "label": "Latest Traffic Source Data 2 Company",
    "sr_no": 122,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_latest_source_data_2_contact",
    "label": "Latest Traffic Source Data 2 Contact",
    "sr_no": 123,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_latest_source_timestamp",
    "label": "Latest Traffic Source Timestamp",
    "sr_no": 124,
    "type": "datetime",
    "fieldType": "number"
  },
  {
    "name": "hs_analytics_latest_source_timestamp_company",
    "label": "Latest Traffic Source Timestamp Company",
    "sr_no": 125,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_analytics_latest_source_timestamp_contact",
    "label": "Latest Traffic Source Timestamp Contact",
    "sr_no": 126,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_likelihood_to_close",
    "label": "Likelihood to close by the close date",
    "sr_no": 127,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_manual_campaign_ids",
    "label": "Manual campaign ids",
    "sr_no": 128,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "engagements_last_meeting_booked_medium",
    "label": "Medium of last booking in meetings tool",
    "sr_no": 129,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_merged_object_ids",
    "label": "Merged Deal IDs",
    "sr_no": 130,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_mrr",
    "label": "Monthly recurring revenue",
    "sr_no": 131,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_net_pipeline_impact",
    "label": "Net Pipeline Impact",
    "sr_no": 132,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_notes_next_activity",
    "label": "Next Activity",
    "sr_no": 133,
    "type": "object_coordinates",
    "fieldType": "text"
  },
  {
    "name": "notes_next_activity_date",
    "label": "Next Activity Date",
    "sr_no": 134,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_notes_next_activity_type",
    "label": "Next Activity Type",
    "sr_no": 135,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_next_meeting_id",
    "label": "Next Meeting ID",
    "sr_no": 136,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_next_meeting_name",
    "label": "Next Meeting Name",
    "sr_no": 137,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_next_meeting_start_time",
    "label": "Next Meeting Start Time",
    "sr_no": 138,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_next_step",
    "label": "Next step",
    "sr_no": 139,
    "type": "string",
    "fieldType": "textarea"
  },
  {
    "name": "hs_next_step_updated_at",
    "label": "Next Step Updated At",
    "sr_no": 140,
    "type": "datetime",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_num_associated_active_deal_registrations",
    "label": "Number of Active Deal Registrations",
    "sr_no": 141,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "num_associated_contacts",
    "label": "Number of Associated Contacts",
    "sr_no": 142,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_num_of_associated_line_items",
    "label": "Number of Associated Line Items",
    "sr_no": 143,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_number_of_call_engagements",
    "label": "Number of call engagements",
    "sr_no": 144,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_num_associated_deal_registrations",
    "label": "Number of Deal Registrations",
    "sr_no": 145,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_num_associated_deal_splits",
    "label": "Number of Deal Splits",
    "sr_no": 146,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_number_of_inbound_calls",
    "label": "Number of inbound calls",
    "sr_no": 147,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_number_of_outbound_calls",
    "label": "Number of outbound calls",
    "sr_no": 148,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_number_of_overdue_tasks",
    "label": "Number of overdue tasks",
    "sr_no": 149,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "num_notes",
    "label": "Number of Sales Activities",
    "sr_no": 150,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_number_of_scheduled_meetings",
    "label": "Number of scheduled meetings",
    "sr_no": 151,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_num_target_accounts",
    "label": "Number of target accounts",
    "sr_no": 152,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "num_contacted_notes",
    "label": "Number of times contacted",
    "sr_no": 153,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_open_amount_in_home_currency",
    "label": "Open amount in home currency",
    "sr_no": 154,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_open_deal_create_date",
    "label": "Open deal create date",
    "sr_no": 155,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_analytics_source",
    "label": "Original Traffic Source",
    "sr_no": 156,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_analytics_source_data_1",
    "label": "Original Traffic Source Drill-Down 1",
    "sr_no": 157,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_analytics_source_data_2",
    "label": "Original Traffic Source Drill-Down 2",
    "sr_no": 158,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hubspot_owner_assigneddate",
    "label": "Owner assigned date",
    "sr_no": 159,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_owning_teams",
    "label": "Owning Teams",
    "sr_no": 160,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_was_imported",
    "label": "Performed in an import",
    "sr_no": 161,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_pinned_engagement_id",
    "label": "Pinned Engagement ID",
    "sr_no": 162,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "pipeline",
    "label": "Pipeline",
    "sr_no": 163,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_primary_associated_company",
    "label": "Primary Associated Company",
    "sr_no": 164,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_priority",
    "label": "Priority",
    "sr_no": 165,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_read_only",
    "label": "Read only object",
    "sr_no": 166,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_sales_email_last_replied",
    "label": "Recent Sales Email Replied Date",
    "sr_no": 167,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_object_source",
    "label": "Record creation source",
    "sr_no": 168,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_id",
    "label": "Record creation source ID",
    "sr_no": 169,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_user_id",
    "label": "Record creation source user ID",
    "sr_no": 170,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_object_id",
    "label": "Record ID",
    "sr_no": 171,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_object_source_label",
    "label": "Record source",
    "sr_no": 172,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_object_source_detail_1",
    "label": "Record source detail 1",
    "sr_no": 173,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_detail_2",
    "label": "Record source detail 2",
    "sr_no": 174,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_detail_3",
    "label": "Record source detail 3",
    "sr_no": 175,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_shared_team_ids",
    "label": "Shared teams",
    "sr_no": 176,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_shared_user_ids",
    "label": "Shared users",
    "sr_no": 177,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_source_object_id",
    "label": "Source Object ID",
    "sr_no": 178,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "engagements_last_meeting_booked_source",
    "label": "Source of last booking in meetings tool",
    "sr_no": 179,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_predicted_amount",
    "label": "The predicted deal amount",
    "sr_no": 180,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_predicted_amount_in_home_currency",
    "label": "The predicted deal amount in your company's currency",
    "sr_no": 181,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_v2_time_in_current_stage",
    "label": "Time in current stage",
    "sr_no": 182,
    "type": "datetime",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_tcv",
    "label": "Total contract value",
    "sr_no": 183,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_unique_creation_key",
    "label": "Unique creation key",
    "sr_no": 184,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_updated_by_user_id",
    "label": "Updated by user ID",
    "sr_no": 185,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_user_ids_of_all_notification_followers",
    "label": "User IDs of all notification followers",
    "sr_no": 186,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_user_ids_of_all_notification_unfollowers",
    "label": "User IDs of all notification unfollowers",
    "sr_no": 187,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_user_ids_of_all_owners",
    "label": "User IDs of all owners",
    "sr_no": 188,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_projected_amount",
    "label": "Weighted amount",
    "sr_no": 189,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_projected_amount_in_home_currency",
    "label": "Weighted amount in company currency",
    "sr_no": 190,
    "type": "number",
    "fieldType": "calculation_equation"
  }
];

// ==========================================
// TICKET PROPERTIES (198 properties)
// ==========================================
// These are default HubSpot ticket fields like subject, content, priority, etc.
export const hubspotTicketProperties: HubSpotDefaultProperty[] = [
  {
    "name": "hs_added_to_waitlist_at",
    "label": "Added to waitlist at",
    "sr_no": 1,
    "type": "string",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_all_associated_contact_companies",
    "label": "All associated contact companies",
    "sr_no": 2,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_all_associated_contact_emails",
    "label": "All associated contact emails",
    "sr_no": 3,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_all_associated_contact_firstnames",
    "label": "All associated contact first names",
    "sr_no": 4,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_all_associated_contact_lastnames",
    "label": "All associated contact last names",
    "sr_no": 5,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_all_associated_contact_mobilephones",
    "label": "All associated contact mobile phones",
    "sr_no": 6,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_all_associated_contact_phones",
    "label": "All associated contact phones",
    "sr_no": 7,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_all_conversation_mentions",
    "label": "All conversation mentions",
    "sr_no": 8,
    "type": "enumeration",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_all_owner_ids",
    "label": "All owner IDs",
    "sr_no": 9,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_all_team_ids",
    "label": "All team IDs",
    "sr_no": 10,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_all_accessible_team_ids",
    "label": "All teams",
    "sr_no": 11,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_applied_sla_rule_config_at",
    "label": "Applied SLA Rule Config Date",
    "sr_no": 12,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_applied_sla_rule_config_id",
    "label": "Applied SLA Rule Config ID",
    "sr_no": 13,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_applied_sla_schedule_at",
    "label": "Applied SLA Schedule Date",
    "sr_no": 14,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_applied_sla_schedule_id",
    "label": "Applied SLA Schedule Id",
    "sr_no": 15,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_assigned_team_ids",
    "label": "Assigned Teams",
    "sr_no": 16,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_assignment_method",
    "label": "Assignment Method",
    "sr_no": 17,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_auto_generated_from_thread_id",
    "label": "Auto-generated from thread id",
    "sr_no": 18,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_overall_visitor_messages_sentiment",
    "label": "Average ticket sentiment",
    "sr_no": 19,
    "type": "enumeration",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_overall_visitor_messages_sentiment_score",
    "label": "Average ticket sentiment score",
    "sr_no": 20,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_all_assigned_business_unit_ids",
    "label": "Brands",
    "sr_no": 21,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_ticket_category",
    "label": "Category",
    "sr_no": 22,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "closed_date",
    "label": "Close date",
    "sr_no": 23,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "nps_score",
    "label": "Conversation NPS score",
    "sr_no": 24,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_conversations_originating_thread_id",
    "label": "Conversations originating thread id",
    "sr_no": 25,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_copied_at",
    "label": "Copied at",
    "sr_no": 26,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_copied_by_user",
    "label": "Copied by user",
    "sr_no": 27,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_copied_from_ticket",
    "label": "Copied ticket",
    "sr_no": 28,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_copied_ticket_source",
    "label": "Copied ticket source",
    "sr_no": 29,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "createdate",
    "label": "Create date",
    "sr_no": 30,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "created_by",
    "label": "Created by",
    "sr_no": 31,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_created_by_user_id",
    "label": "Created by user ID",
    "sr_no": 32,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_4",
    "label": "Cumulative time in \"Closed (Support Pipeline)\"",
    "sr_no": 33,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_1",
    "label": "Cumulative time in \"New (Support Pipeline)\"",
    "sr_no": 34,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_2",
    "label": "Cumulative time in \"Waiting on contact (Support Pipeline)\"",
    "sr_no": 35,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_cumulative_time_in_3",
    "label": "Cumulative time in \"Waiting on us (Support Pipeline)\"",
    "sr_no": 36,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_custom_inbox",
    "label": "Custom inbox ID",
    "sr_no": 37,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_customer_agent_ticket_status",
    "label": "Customer Agent ticket status",
    "sr_no": 38,
    "type": "enumeration",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_date_entered_4",
    "label": "Date entered 'Closed (Support Pipeline)'",
    "sr_no": 39,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_entered_1",
    "label": "Date entered 'New (Support Pipeline)'",
    "sr_no": 40,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_entered_2",
    "label": "Date entered 'Waiting on contact (Support Pipeline)'",
    "sr_no": 41,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_entered_3",
    "label": "Date entered 'Waiting on us (Support Pipeline)'",
    "sr_no": 42,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_v2_date_entered_4",
    "label": "Date entered \"Closed (Support Pipeline)\"",
    "sr_no": 43,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_1",
    "label": "Date entered \"New (Support Pipeline)\"",
    "sr_no": 44,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_2",
    "label": "Date entered \"Waiting on contact (Support Pipeline)\"",
    "sr_no": 45,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_entered_3",
    "label": "Date entered \"Waiting on us (Support Pipeline)\"",
    "sr_no": 46,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_date_exited_4",
    "label": "Date exited 'Closed (Support Pipeline)'",
    "sr_no": 47,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_exited_1",
    "label": "Date exited 'New (Support Pipeline)'",
    "sr_no": 48,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_exited_2",
    "label": "Date exited 'Waiting on contact (Support Pipeline)'",
    "sr_no": 49,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_date_exited_3",
    "label": "Date exited 'Waiting on us (Support Pipeline)'",
    "sr_no": 50,
    "type": "datetime",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_v2_date_exited_4",
    "label": "Date exited \"Closed (Support Pipeline)\"",
    "sr_no": 51,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_1",
    "label": "Date exited \"New (Support Pipeline)\"",
    "sr_no": 52,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_2",
    "label": "Date exited \"Waiting on contact (Support Pipeline)\"",
    "sr_no": 53,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_v2_date_exited_3",
    "label": "Date exited \"Waiting on us (Support Pipeline)\"",
    "sr_no": 54,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "last_engagement_date",
    "label": "Date of last engagement",
    "sr_no": 55,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_draft_user_ids",
    "label": "Draft UserIds",
    "sr_no": 56,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_email_subject",
    "label": "Email subject",
    "sr_no": 57,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_external_object_ids",
    "label": "External object ids",
    "sr_no": 58,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_file_upload",
    "label": "File upload",
    "sr_no": 59,
    "type": "string",
    "fieldType": "file"
  },
  {
    "name": "first_agent_reply_date",
    "label": "First agent email response date",
    "sr_no": 60,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_first_agent_message_sent_at",
    "label": "First agent response date",
    "sr_no": 61,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_first_assignee_type",
    "label": "First Assignee Type",
    "sr_no": 62,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_is_one_touch_ticket",
    "label": "First contact resolution",
    "sr_no": 63,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_first_visitor_message_sentiment",
    "label": "First message sentiment",
    "sr_no": 64,
    "type": "enumeration",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_first_visitor_message_sentiment_score",
    "label": "First message sentiment score",
    "sr_no": 65,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_first_agent_message_sent_by",
    "label": "First responding rep",
    "sr_no": 66,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_form_id",
    "label": "Form",
    "sr_no": 67,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_form_submission_conversion_id",
    "label": "Form submission conversion ID ",
    "sr_no": 68,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_help_desk_onboarding_ticket",
    "label": "Help Desk onboarding ticket",
    "sr_no": 69,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_helpdesk_sort_timestamp",
    "label": "Helpdesk Sort Timestamp",
    "sr_no": 70,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_createdate",
    "label": "HubSpot create date",
    "sr_no": 71,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hubspot_team_id",
    "label": "HubSpot team",
    "sr_no": 72,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_in_helpdesk",
    "label": "In Help Desk",
    "sr_no": 73,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_in_waitlist",
    "label": "In Waitlist",
    "sr_no": 74,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_inbox_id",
    "label": "Inbox ID",
    "sr_no": 75,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_is_closed_in_time_to_close_sla_count",
    "label": "Is Closed in Time to Close Sla Count",
    "sr_no": 76,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_is_closed_in_time_to_first_response_sla_count",
    "label": "Is Closed in Time to First Response Sla Count",
    "sr_no": 77,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_is_latest_message_failed",
    "label": "Is latest message failed",
    "sr_no": 78,
    "type": "bool",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_is_latest_message_hidden_from_all",
    "label": "Is latest message hidden from all",
    "sr_no": 79,
    "type": "bool",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_is_visible_in_help_desk",
    "label": "Is Visible in Help desk",
    "sr_no": 80,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_ticket_language_ai_tag",
    "label": "Language",
    "sr_no": 81,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_notes_last_activity",
    "label": "Last Activity",
    "sr_no": 82,
    "type": "object_coordinates",
    "fieldType": "text"
  },
  {
    "name": "hs_lastactivitydate",
    "label": "Last activity date",
    "sr_no": 83,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "notes_last_updated",
    "label": "Last Activity Date (Ticket Note)",
    "sr_no": 84,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_feedback_last_ces_follow_up",
    "label": "Last CES survey comment",
    "sr_no": 85,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_feedback_last_survey_date",
    "label": "Last CES survey date",
    "sr_no": 86,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_feedback_last_ces_rating",
    "label": "Last CES survey rating",
    "sr_no": 87,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_last_closed_date",
    "label": "Last Closed Date",
    "sr_no": 88,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "notes_last_contacted",
    "label": "Last Contacted (Ticket Note)",
    "sr_no": 89,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_lastcontacted",
    "label": "Last contacted date",
    "sr_no": 90,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "last_reply_date",
    "label": "Last customer reply date",
    "sr_no": 91,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_email_activity",
    "label": "Last email activity",
    "sr_no": 92,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_last_email_date",
    "label": "Last email date",
    "sr_no": 93,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_email_details",
    "label": "Last email details",
    "sr_no": 94,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_last_email_id",
    "label": "Last email id",
    "sr_no": 95,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_last_email_type",
    "label": "Last Email Type",
    "sr_no": 96,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_last_message_from_visitor",
    "label": "Last message from visitor",
    "sr_no": 97,
    "type": "bool",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_last_message_received_at",
    "label": "Last message received date",
    "sr_no": 98,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_last_visitor_message_sentiment",
    "label": "Last message sentiment",
    "sr_no": 99,
    "type": "enumeration",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_lastmodifieddate",
    "label": "Last modified date",
    "sr_no": 100,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_last_message_sent_at",
    "label": "Last response date",
    "sr_no": 101,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_message_attachment_types",
    "label": "Latest message attachment types",
    "sr_no": 102,
    "type": "enumeration",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_message_is_forwarded_email",
    "label": "Latest message is forwarded email",
    "sr_no": 103,
    "type": "bool",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_message_is_thread_comment",
    "label": "Latest message is thread comment",
    "sr_no": 104,
    "type": "bool",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_message_seen_by_agent_ids",
    "label": "Latest message seen by agent ids",
    "sr_no": 105,
    "type": "enumeration",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_last_visitor_message_sentiment_score",
    "label": "Latest message sentiment score",
    "sr_no": 106,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_latest_message_visible_to_visitor",
    "label": "Latest message visible to visitor",
    "sr_no": 107,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_latest_message_visible_to_visitor_sent_at",
    "label": "Latest message visible to visitor sent at",
    "sr_no": 108,
    "type": "datetime",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_v2_latest_time_in_4",
    "label": "Latest time in \"Closed (Support Pipeline)\"",
    "sr_no": 109,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_1",
    "label": "Latest time in \"New (Support Pipeline)\"",
    "sr_no": 110,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_2",
    "label": "Latest time in \"Waiting on contact (Support Pipeline)\"",
    "sr_no": 111,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_v2_latest_time_in_3",
    "label": "Latest time in \"Waiting on us (Support Pipeline)\"",
    "sr_no": 112,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_mentioned_note_user_ids",
    "label": "mentioned_note_user_ids",
    "sr_no": 113,
    "type": "enumeration",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_mentions_user_ids",
    "label": "mentions_user_ids",
    "sr_no": 114,
    "type": "enumeration",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_merged_object_ids",
    "label": "Merged Ticket IDs",
    "sr_no": 115,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_msteams_message_id",
    "label": "Microsoft Teams message ID for this ticket.",
    "sr_no": 116,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_most_relevant_sla_status",
    "label": "Most relevant SLA status",
    "sr_no": 117,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_most_relevant_sla_type",
    "label": "Most Relevant SLA Type",
    "sr_no": 118,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_notes_next_activity",
    "label": "Next Activity",
    "sr_no": 119,
    "type": "object_coordinates",
    "fieldType": "text"
  },
  {
    "name": "hs_nextactivitydate",
    "label": "Next activity date",
    "sr_no": 120,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "notes_next_activity_date",
    "label": "Next Activity Date (Ticket Note)",
    "sr_no": 121,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_notes_next_activity_type",
    "label": "Next Activity Type",
    "sr_no": 122,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "nps_follow_up_answer",
    "label": "NPS follow up",
    "sr_no": 123,
    "type": "string",
    "fieldType": "textarea"
  },
  {
    "name": "nps_follow_up_question_version",
    "label": "NPS follow up question",
    "sr_no": 124,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_num_associated_companies",
    "label": "Number of Associated Companies",
    "sr_no": 125,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_num_associated_conversations",
    "label": "Number of Associated Conversations",
    "sr_no": 126,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "num_notes",
    "label": "Number of Sales Activities",
    "sr_no": 127,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_num_times_contacted",
    "label": "Number of times contacted",
    "sr_no": 128,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "num_contacted_notes",
    "label": "Number of times contacted (Ticket Note)",
    "sr_no": 129,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_number_of_touches",
    "label": "Number of touches",
    "sr_no": 130,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_originating_channel_instance_id",
    "label": "Originating channel account",
    "sr_no": 131,
    "type": "enumeration",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_originating_generic_channel_id",
    "label": "Originating channel type",
    "sr_no": 132,
    "type": "enumeration",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_conversations_originating_message_id",
    "label": "Originating Conversations Message Id",
    "sr_no": 133,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_originating_email_engagement_id",
    "label": "Originating email engagement id",
    "sr_no": 134,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_outbound_ticket",
    "label": "Outbound ticket",
    "sr_no": 135,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hubspot_owner_assigneddate",
    "label": "Owner assigned date",
    "sr_no": 136,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_owning_teams",
    "label": "Owning Teams",
    "sr_no": 137,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_was_imported",
    "label": "Performed in an import",
    "sr_no": 138,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_pinned_engagement_id",
    "label": "Pinned Engagement ID",
    "sr_no": 139,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_pipeline",
    "label": "Pipeline",
    "sr_no": 140,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_primary_company",
    "label": "Primary Company",
    "sr_no": 141,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_primary_company_id",
    "label": "Primary Company ID",
    "sr_no": 142,
    "type": "number",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_primary_company_name",
    "label": "Primary Company Name",
    "sr_no": 143,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "hs_ticket_priority",
    "label": "Priority",
    "sr_no": 144,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_read_only",
    "label": "Read only object",
    "sr_no": 145,
    "type": "bool",
    "fieldType": "booleancheckbox"
  },
  {
    "name": "hs_sales_email_last_replied",
    "label": "Recent Sales Email Replied Date",
    "sr_no": 146,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_object_source",
    "label": "Record creation source",
    "sr_no": 147,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_id",
    "label": "Record creation source ID",
    "sr_no": 148,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_user_id",
    "label": "Record creation source user ID",
    "sr_no": 149,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_object_id",
    "label": "Record ID",
    "sr_no": 150,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_object_source_label",
    "label": "Record source",
    "sr_no": 151,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_object_source_detail_1",
    "label": "Record source detail 1",
    "sr_no": 152,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_detail_2",
    "label": "Record source detail 2",
    "sr_no": 153,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_object_source_detail_3",
    "label": "Record source detail 3",
    "sr_no": 154,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "source_thread_id",
    "label": "Reference to email thread",
    "sr_no": 155,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "source_ref",
    "label": "Reference to source-specific object",
    "sr_no": 156,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_resolution",
    "label": "Resolution",
    "sr_no": 157,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_retroactive_sla_update_at",
    "label": "Retroactive SLA update at",
    "sr_no": 158,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_shared_team_ids",
    "label": "Shared teams",
    "sr_no": 159,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_shared_user_ids",
    "label": "Shared users",
    "sr_no": 160,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_sla_operating_hours",
    "label": "SLA operating hours",
    "sr_no": 161,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_sla_pause_status",
    "label": "SLA Pause Status",
    "sr_no": 162,
    "type": "enumeration",
    "fieldType": "radio"
  },
  {
    "name": "hs_snoozed_by_user_id",
    "label": "Snoozed by user ID",
    "sr_no": 163,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "source_type",
    "label": "Source",
    "sr_no": 164,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_source_object_id",
    "label": "Source Object ID",
    "sr_no": 165,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_source_url",
    "label": "Source url",
    "sr_no": 166,
    "type": "string",
    "fieldType": "calculation_rollup"
  },
  {
    "name": "tags",
    "label": "Tags",
    "sr_no": 167,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_thread_ids_to_restore",
    "label": "Thread IDs To Restore",
    "sr_no": 168,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "content",
    "label": "Ticket description",
    "sr_no": 169,
    "type": "string",
    "fieldType": "textarea"
  },
  {
    "name": "hs_ticket_id",
    "label": "Ticket ID",
    "sr_no": 170,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "subject",
    "label": "Ticket name",
    "sr_no": 171,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hubspot_owner_id",
    "label": "Ticket owner",
    "sr_no": 172,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_ticket_reopened_at",
    "label": "Ticket reopen date",
    "sr_no": 173,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_pipeline_stage",
    "label": "Ticket status",
    "sr_no": 174,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_tag_ids",
    "label": "Ticket Tags",
    "sr_no": 175,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_time_in_4",
    "label": "Time in 'Closed (Support Pipeline)'",
    "sr_no": 176,
    "type": "number",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_time_in_1",
    "label": "Time in 'New (Support Pipeline)'",
    "sr_no": 177,
    "type": "number",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_time_in_2",
    "label": "Time in 'Waiting on contact (Support Pipeline)'",
    "sr_no": 178,
    "type": "number",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "hs_time_in_3",
    "label": "Time in 'Waiting on us (Support Pipeline)'",
    "sr_no": 179,
    "type": "number",
    "fieldType": "calculation_read_time"
  },
  {
    "name": "time_to_close",
    "label": "Time to close",
    "sr_no": 180,
    "type": "number",
    "fieldType": "calculation_equation"
  },
  {
    "name": "hs_time_to_close_in_operating_hours",
    "label": "Time to close in SLA hours",
    "sr_no": 181,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_time_to_close_sla_at",
    "label": "Time to Close SLA Due Date",
    "sr_no": 182,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_time_to_close_sla_status",
    "label": "Time to Close SLA Ticket Status",
    "sr_no": 183,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "time_to_first_agent_reply",
    "label": "Time to first agent email reply",
    "sr_no": 184,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_time_to_first_assign",
    "label": "Time to first assign",
    "sr_no": 185,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_time_to_first_response_in_operating_hours",
    "label": "Time to first response in SLA hours",
    "sr_no": 186,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_time_to_first_response_sla_at",
    "label": "Time to First Response SLA Due Date",
    "sr_no": 187,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_time_to_first_response_sla_status",
    "label": "Time to First Response SLA Status",
    "sr_no": 188,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_time_to_next_response_sla_at",
    "label": "Time to Next Response SLA Due Date",
    "sr_no": 189,
    "type": "datetime",
    "fieldType": "date"
  },
  {
    "name": "hs_time_to_next_response_sla_status",
    "label": "Time to Next Response SLA Status",
    "sr_no": 190,
    "type": "enumeration",
    "fieldType": "select"
  },
  {
    "name": "hs_unique_creation_key",
    "label": "Unique creation key",
    "sr_no": 191,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_updated_by_user_id",
    "label": "Updated by user ID",
    "sr_no": 192,
    "type": "number",
    "fieldType": "number"
  },
  {
    "name": "hs_user_ids_of_all_notification_followers",
    "label": "User IDs of all notification followers",
    "sr_no": 193,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_user_ids_of_all_notification_unfollowers",
    "label": "User IDs of all notification unfollowers",
    "sr_no": 194,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_user_ids_of_all_owners",
    "label": "User IDs of all owners",
    "sr_no": 195,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_seen_by_agent_ids",
    "label": "Users interaction",
    "sr_no": 196,
    "type": "enumeration",
    "fieldType": "checkbox"
  },
  {
    "name": "hs_waitlist_routing_targets",
    "label": "Waitlist routing targets",
    "sr_no": 197,
    "type": "string",
    "fieldType": "text"
  },
  {
    "name": "hs_waitlist_sort_value",
    "label": "Waitlist sort value",
    "sr_no": 198,
    "type": "datetime",
    "fieldType": "calculation_equation"
  }
];

// ==========================================
// COMBINED & UTILITY EXPORTS
// ==========================================

// All Properties Combined (930 total) - Use if you need everything together
export const hubspotAllDefaultProperties: HubSpotDefaultProperty[] = [
  ...hubspotContactProperties,
  ...hubspotCompanyProperties,
  ...hubspotDealProperties,
  ...hubspotTicketProperties
];

// Summary counts for easy reference
export const propertyCounts = {
  contacts: 355,
  companies: 186,
  deals: 190,
  tickets: 198,
  total: 930
};
