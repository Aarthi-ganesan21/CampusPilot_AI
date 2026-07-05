import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
import { Search, BookMarked, BookOpen, ExternalLink, RefreshCw, AlertTriangle, CheckCircle2, Bookmark, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: "Computer Science" | "Engineering" | "Mathematics" | "Literature" | "General";
  availability: "Available" | "Issued";
  isbn?: string;
  coverSeed?: string;
}

interface IssuedBookRecord {
  id: string;
  title: string;
  author: string;
  issueDate: string;
  returnDate: string;
  fineAmount: number;
}

export default function StudentLibrary() {
  const { showToast } = useToast();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("All");

  // Mock Book Catalog database
  const [books, setBooks] = useState<LibraryBook[]>([
    { id: "b1", title: "Introduction to Algorithms", author: "Thomas H. Cormen", category: "Computer Science", availability: "Available", isbn: "978-0262033848", coverSeed: "cormen" },
    { id: "b2", title: "Clean Code", author: "Robert C. Martin", category: "Computer Science", availability: "Issued", isbn: "978-0132350884", coverSeed: "clean" },
    { id: "b3", title: "Engineering Mathematics", author: "Dr. B.S. Grewal", category: "Mathematics", availability: "Available", isbn: "978-8174091956", coverSeed: "maths" },
    { id: "b4", title: "Database System Concepts", author: "Abraham Silberschatz", category: "Computer Science", availability: "Available", isbn: "978-0073523323", coverSeed: "db" },
    { id: "b5", title: "To Kill a Mockingbird", author: "Harper Lee", category: "Literature", availability: "Available", isbn: "978-0061120084", coverSeed: "mockingbird" },
    { id: "b6", title: "Fundamentals of Thermodynamics", author: "Claus Borgnakke", category: "Engineering", availability: "Issued", isbn: "978-1118131992", coverSeed: "thermo" },
    { id: "b7", title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", category: "Computer Science", availability: "Available", isbn: "978-0136042594", coverSeed: "ai" }
  ]);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<LibraryBook[]>([
    { id: "r1", title: "Design Patterns: Elements of Reusable Object-Oriented Software", author: "Gang of Four", category: "Computer Science", availability: "Available", isbn: "978-0201633610", coverSeed: "gof" },
    { id: "r2", title: "A Brief History of Time", author: "Stephen Hawking", category: "General", availability: "Available", isbn: "978-0553380163", coverSeed: "hawking" }
  ]);

  // Issued records
  const [issuedRecords, setIssuedRecords] = useState<IssuedBookRecord[]>([
    {
      id: "rec1",
      title: "Clean Code",
      author: "Robert C. Martin",
      issueDate: "2026-06-20",
      returnDate: "2026-07-04",
      fineAmount: 0
    },
    {
      id: "rec2",
      title: "Fundamentals of Thermodynamics",
      author: "Claus Borgnakke",
      issueDate: "2026-05-15",
      returnDate: "2026-05-30",
      fineAmount: 50 // Past return date fine alert
    }
  ]);

  // Issue Book Handler (immediately updates availability, updates issued record list, triggers toast)
  const handleIssueBook = (bookId: string, source: "catalog" | "recommend") => {
    if (source === "catalog") {
      const book = books.find(b => b.id === bookId);
      if (!book || book.availability === "Issued") return;

      // Update catalog book state
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, availability: "Issued" as const } : b));
      
      // Add issued record
      const newRec: IssuedBookRecord = {
        id: "rec_" + Math.random().toString(36).substr(2, 9),
        title: book.title,
        author: book.author,
        issueDate: new Date().toISOString().split("T")[0],
        returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 14 days return window
        fineAmount: 0
      };
      setIssuedRecords(prev => [newRec, ...prev]);
      showToast(`Successfully issued "${book.title}"! Due date is logged in your catalog.`, "success");
    } else {
      const book = recommendations.find(b => b.id === bookId);
      if (!book || book.availability === "Issued") return;

      // Update recommendations list state
      setRecommendations(prev => prev.map(b => b.id === bookId ? { ...b, availability: "Issued" as const } : b));

      const newRec: IssuedBookRecord = {
        id: "rec_" + Math.random().toString(36).substr(2, 9),
        title: book.title,
        author: book.author,
        issueDate: new Date().toISOString().split("T")[0],
        returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        fineAmount: 0
      };
      setIssuedRecords(prev => [newRec, ...prev]);
      showToast(`Successfully checked out recommendation: "${book.title}"!`, "success");
    }
  };

  // Return Book Handler
  const handleReturnBook = (recordId: string, title: string) => {
    // Remove record or clear fine
    setIssuedRecords(prev => prev.filter(r => r.id !== recordId));
    
    // Set matching books back to Available if applicable
    setBooks(prev => prev.map(b => b.title === title ? { ...b, availability: "Available" as const } : b));
    setRecommendations(prev => prev.map(b => b.title === title ? { ...b, availability: "Available" as const } : b));

    showToast(`Book "${title}" has been successfully returned and fine cleared!`, "success");
  };

  // Filter books list
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    const matchesAvailability = selectedAvailability === "All" || book.availability === selectedAvailability;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="space-y-8 animate-fadeIn" id="library-spec-container">
      {/* Top Dossier Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Academic & Digital Library</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Search physical textbook holdings, issue digital checkouts, and navigate portal links.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Title, Author, Category..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Main Catalog Search + Filters */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Filters shelf */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Category:</span>
              {["All", "Computer Science", "Engineering", "Mathematics", "Literature"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${selectedCategory === cat ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 hover:bg-slate-100 text-slate-600"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Availability:</span>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 px-2.5 py-1.5 rounded-xl cursor-pointer"
              >
                <option value="All">All Books</option>
                <option value="Available">Available</option>
                <option value="Issued">Issued</option>
              </select>
            </div>
          </div>

          {/* Book Catalog Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5">
            <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">Available Catalog Textbook Holdings</h4>

            <div className="grid sm:grid-cols-2 gap-4">
              {filteredBooks.map((book) => (
                <div key={book.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/20 hover:border-slate-200 hover:shadow-sm transition-all flex gap-4 items-start">
                  {/* Book Spine Visual */}
                  <div className="w-14 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg text-white font-black text-[9px] p-2 flex flex-col justify-between shadow-inner shrink-0 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-white/20"></div>
                    <span className="leading-tight truncate max-w-full uppercase tracking-wider">{book.category.substring(0, 4)}</span>
                    <Bookmark size={10} className="text-white/80 self-end" />
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div>
                      <h5 className="text-xs font-extrabold text-slate-800 leading-normal truncate">{book.title}</h5>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{book.author}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      {book.availability === "Available" ? (
                        <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold uppercase">Available</span>
                      ) : (
                        <span className="text-[9px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold uppercase">Issued</span>
                      )}

                      <button
                        disabled={book.availability === "Issued"}
                        onClick={() => handleIssueBook(book.id, "catalog")}
                        className={`px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200`}
                      >
                        {book.availability === "Available" ? "Issue Book" : "Checked Out"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredBooks.length === 0 && (
                <p className="col-span-2 text-center text-xs font-semibold text-slate-400 py-8">No books found in this catalog section.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Recommendations, Digital Portals, Active Borrows */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Recommended for You Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900">Recommended for You</h4>

            <div className="space-y-4">
              {recommendations.map((book) => (
                <div key={book.id} className="p-3 bg-indigo-50/30 border border-indigo-50 rounded-2xl flex gap-3 items-center">
                  <div className="w-10 h-14 bg-indigo-600 rounded-md text-white font-bold text-[8px] p-1 flex flex-col justify-between shrink-0">
                    <span>CS</span>
                    <Bookmark size={8} className="self-end" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 truncate">{book.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{book.author}</p>
                    </div>
                    <button
                      disabled={book.availability === "Issued"}
                      onClick={() => handleIssueBook(book.id, "recommend")}
                      className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${book.availability === "Available" ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" : "bg-slate-100 text-slate-400"}`}
                    >
                      {book.availability === "Available" ? "Quick Issue" : "Issued"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE ACCOUNT BORROWS & FINE ALERTS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900">Active Borrows & Fines</h4>

            <div className="space-y-3">
              {issuedRecords.map((rec) => (
                <div key={rec.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-extrabold text-slate-800 truncate max-w-[140px]">{rec.title}</h5>
                    {rec.fineAmount > 0 ? (
                      <span className="text-[9px] text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase">
                        <AlertTriangle size={10} /> Fine: Rs.{rec.fineAmount}
                      </span>
                    ) : (
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase">
                        No Fine
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Calendar size={12} /> Due date: {rec.returnDate}
                  </p>
                  <button
                    onClick={() => handleReturnBook(rec.id, rec.title)}
                    className="text-[9px] font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    Return Textbook →
                  </button>
                </div>
              ))}
              {issuedRecords.length === 0 && (
                <p className="text-center text-xs font-semibold text-slate-400 py-4">No active borrowings recorded.</p>
              )}
            </div>
          </div>

          {/* Digital Library Section (learning portals) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-600" /> Digital Learning Portals
            </h4>

            <div className="space-y-3">
              {[
                { name: "NPTEL Portal", url: "https://nptel.ac.in", desc: "Government online certification courses." },
                { name: "Coursera Campus", url: "https://coursera.org", desc: "Specialized computer systems & industry degrees." },
                { name: "MIT OpenCourseWare", url: "https://ocw.mit.edu", desc: "Syllabus libraries, videos, & textbooks." }
              ].map((portal, idx) => (
                <a
                  key={idx}
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-slate-50 border border-slate-100 hover:border-indigo-100 rounded-2xl flex justify-between items-center hover:bg-slate-100/70 transition-all text-slate-700"
                >
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-800">{portal.name}</h5>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{portal.desc}</p>
                  </div>
                  <ExternalLink size={12} className="text-slate-400 shrink-0" />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
