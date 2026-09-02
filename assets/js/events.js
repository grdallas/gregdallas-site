/* ---------------------------------------------------------------------------
   PERFORMANCES
   To add a show, copy a block and fill it in. Newest or oldest order doesn't
   matter — the page sorts by date and splits upcoming vs. past automatically.

     date:   "YYYY-MM-DD"  (required)
     time:   "8:00 PM"     (optional)
     title:  what the billing says
     venue:  venue name
     city:   "St. Louis, MO"
     link:   tickets or event page (optional — omit to hide the link)
     note:   anything extra, e.g. "with the Greg Dallas Trio" (optional)
--------------------------------------------------------------------------- */

window.EVENTS = [
  {
    date:  "2026-08-29",
    time:  "9:00 PM – 1:00 AM",
    title: "The Dhoruba Collective",
    venue: "Hi Hat Lounge",
    city:  "St. Louis, MO"
  },
  {
    date:  "2026-09-04",
    time:  "7:30 PM",
    title: "Conspiracy Deliracy",
    venue: "Scout Hall",
    city:  "Cape Girardeau, MO",
    note:  "Doors at 7:00"
  },
  {
    date:  "2026-10-25",
    time:  "11:30 AM – 2:30 PM",
    title: "Greg Dallas Trio",
    venue: "St. John UCC",
    city:  "St. Charles, MO",
    note:  "Fall Festival"
  }

  // Copy a block above to add a show. Only `date` is required.
  //   date: "YYYY-MM-DD"   time: "8:00 PM"   link: ticket URL   note: anything extra
];
