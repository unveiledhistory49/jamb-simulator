/**
 * Supabase Client & REST API Helper
 * Connects directly to Supabase PostgREST for lightning-fast, zero-dependency data operations.
 */

const SUPABASE_URL = "https://alliuteqkbblxqwjbtsr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbGl1dGVxa2JibHhxd2pidHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDg5NTgsImV4cCI6MjEwNDAyNDk1OH0.gaEZwunMe4pk1EcxgNGqWiN8vvE35IMwAWKabTVmoNs";

const headers = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};

// Simple fast SHA-256 implementation using native browser crypto
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// User Session in LocalStorage
const STORAGE_KEY = "jamb_cbt_current_user";

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function storeUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {}
}

export function logoutUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

// 1. Sign In
export async function signIn(username, password) {
  const cleanUsername = username.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/jamb_users?username=eq.${encodeURIComponent(cleanUsername)}`,
    { headers }
  );

  if (!res.ok) {
    throw new Error("Could not connect to authentication service.");
  }

  const users = await res.json();
  if (!users || users.length === 0) {
    throw new Error("Username not found. Please create an account.");
  }

  const user = users[0];
  if (user.password_hash !== passwordHash) {
    throw new Error("Incorrect password. Please try again.");
  }

  const sessionUser = {
    id: user.id,
    username: user.username,
    created_at: user.created_at
  };

  storeUser(sessionUser);
  return sessionUser;
}

// 2. Sign Up (Dead simple: just username and password)
export async function signUp(username, password) {
  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3) {
    throw new Error("Username must be at least 3 characters.");
  }
  if (password.length < 3) {
    throw new Error("Password must be at least 3 characters.");
  }

  // Check if username already exists
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/jamb_users?username=eq.${encodeURIComponent(cleanUsername)}`,
    { headers }
  );

  if (checkRes.ok) {
    const existing = await checkRes.json();
    if (existing && existing.length > 0) {
      throw new Error(`Username "${cleanUsername}" is already taken.`);
    }
  }

  const passwordHash = await hashPassword(password);
  const newId = "usr_" + Math.random().toString(36).substring(2, 11);

  const createRes = await fetch(`${SUPABASE_URL}/rest/v1/jamb_users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      id: newId,
      username: cleanUsername,
      password_hash: passwordHash
    })
  });

  if (!createRes.ok) {
    throw new Error("Failed to create account. Please try again.");
  }

  const sessionUser = {
    id: newId,
    username: cleanUsername,
    created_at: new Date().toISOString()
  };

  storeUser(sessionUser);
  return sessionUser;
}

// 3. Save Exam to Supabase
export async function saveExamToCloud(examSummary, username) {
  if (!username) return null;

  try {
    const payload = {
      id: examSummary.exam_id,
      username: username.toLowerCase(),
      mode: examSummary.mode,
      duration_seconds: examSummary.duration_seconds || 7200,
      time_spent_seconds: examSummary.time_spent_seconds || 0,
      total_score: examSummary.total_score,
      max_score: examSummary.max_score,
      subject_scores: examSummary.subject_scores || {},
      summary: examSummary
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/jamb_exams`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    return res.ok;
  } catch (err) {
    console.warn("Could not sync exam to Supabase:", err);
    return false;
  }
}

// 4. Fetch User Exams from Supabase
export async function fetchUserExams(username) {
  if (!username) return [];

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/jamb_exams?username=eq.${encodeURIComponent(username.toLowerCase())}&order=timestamp.desc&limit=30`,
      { headers }
    );

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn("Could not load user exams:", err);
    return [];
  }
}

// 5. Save Mistakes to Supabase Mistake Bank
export async function saveMistakesToCloud(wrongQuestions, username) {
  if (!username || !wrongQuestions || wrongQuestions.length === 0) return;

  try {
    const rows = wrongQuestions.map(q => ({
      id: `${username.toLowerCase()}_${q.id}`,
      username: username.toLowerCase(),
      question_id: q.id,
      subject_id: q.subject_id,
      topic: q.topic || 'General',
      question_text: q.question,
      options: {
        a: q.option_a,
        b: q.option_b,
        c: q.option_c,
        d: q.option_d
      },
      user_answer: q.user_answer,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      is_resolved: false
    }));

    await fetch(`${SUPABASE_URL}/rest/v1/jamb_user_mistakes`, {
      method: "POST",
      headers: {
        ...headers,
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify(rows)
    });
  } catch (err) {
    console.warn("Could not save mistakes to Supabase:", err);
  }
}

// 6. Fetch Unresolved Mistakes for User
export async function fetchUserMistakes(username) {
  if (!username) return [];

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/jamb_user_mistakes?username=eq.${encodeURIComponent(username.toLowerCase())}&is_resolved=eq.false&order=created_at.desc`,
      { headers }
    );

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn("Could not fetch mistakes:", err);
    return [];
  }
}

// 7. Resolve a Mistake in Cloud
export async function resolveMistakeInCloud(mistakeId, username) {
  if (!mistakeId || !username) return;

  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/jamb_user_mistakes?id=eq.${encodeURIComponent(mistakeId)}&username=eq.${encodeURIComponent(username.toLowerCase())}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ is_resolved: true })
      }
    );
  } catch (err) {
    console.warn("Could not resolve mistake in Supabase:", err);
  }
}

// 8. Local Bookmarks Cache
export function getLocalBookmarks(username) {
  try {
    const key = `jamb_cbt_starred_${(username || 'guest').toLowerCase()}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function setLocalBookmarks(username, bookmarks) {
  try {
    const key = `jamb_cbt_starred_${(username || 'guest').toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(bookmarks));
  } catch (e) {}
}

// 9. Save Bookmark to Supabase
export async function saveBookmarkToCloud(question, username) {
  if (!question || !username) return null;

  try {
    const cleanUser = username.toLowerCase();
    const qId = String(question.id);
    const row = {
      id: `${cleanUser}_${qId}`,
      username: cleanUser,
      question_id: qId,
      subject_id: question.subject_id,
      topic: question.topic || 'General',
      year: question.year || null,
      question_text: question.question || question.question_text,
      options: question.options || {
        a: question.option_a,
        b: question.option_b,
        c: question.option_c,
        d: question.option_d
      },
      correct_answer: question.correct_answer || '',
      explanation: question.explanation || '',
      passage_id: question.passage_id || null
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/jamb_user_bookmarks`, {
      method: "POST",
      headers: {
        ...headers,
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify(row)
    });

    return res.ok;
  } catch (err) {
    console.warn("Could not save bookmark to Supabase:", err);
    return false;
  }
}

// 10. Remove Bookmark from Supabase
export async function removeBookmarkFromCloud(questionId, username) {
  if (!questionId || !username) return false;

  try {
    const cleanUser = username.toLowerCase();
    const rowId = `${cleanUser}_${questionId}`;
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/jamb_user_bookmarks?id=eq.${encodeURIComponent(rowId)}`,
      {
        method: "DELETE",
        headers
      }
    );

    return res.ok;
  } catch (err) {
    console.warn("Could not delete bookmark from Supabase:", err);
    return false;
  }
}

// 11. Fetch User Bookmarks from Supabase
export async function fetchUserBookmarks(username) {
  if (!username) return [];

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/jamb_user_bookmarks?username=eq.${encodeURIComponent(username.toLowerCase())}&order=created_at.desc`,
      { headers }
    );

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn("Could not fetch bookmarks:", err);
    return [];
  }
}

