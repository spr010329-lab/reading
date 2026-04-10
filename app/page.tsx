"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchBooks();
    fetchParticipants();
  }, []);

  const fetchBooks = async () => {
    const { data } = await supabase.from("books").select("*");
    setBooks(data || []);
  };

  const fetchParticipants = async () => {
    const { data } = await supabase.from("participants").select("*");
    setParticipants(data || []);
  };

  const toggleStatus = async (book) => {
    const newStatus = book.status === "available" ? "borrowed" : "available";

    await supabase
      .from("books")
      .update({
        status: newStatus,
        borrower: newStatus === "borrowed" ? "누군가" : "",
      })
      .eq("id", book.id);

    fetchBooks();
  };

  const addParticipant = async () => {
    if (!newName) return;

    await supabase.from("participants").insert({
      name: newName,
      participation: 0,
      influence: 0,
      bonus: 0,
    });

    setNewName("");
    fetchParticipants();
  };

  const updateScore = async (id, field, value) => {
    await supabase
      .from("participants")
      .update({ [field]: Number(value) })
      .eq("id", id);

    fetchParticipants();
  };

  const getTotal = (p) =>
    Number(p.participation || 0) +
    Number(p.influence || 0) +
    Number(p.bonus || 0);

  const sorted = [...participants].sort((a, b) => getTotal(b) - getTotal(a));

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.owner.toLowerCase().includes(search.toLowerCase())
  );

  const getMedal = (i) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `${i + 1}`;
  };

  return (
    <div style={{ padding: "40px", background: "#f5f6fa" }}>
      <h1 style={{ textAlign: "center", fontSize: "32px", marginBottom: "30px" }}>
        📚 유일하이스트 독서 챌린지
      </h1>

      {/* 🔥 핵심: 책 2 / 순위 1 비율 */}
      <div style={{ display: "flex", gap: "30px" }}>
        
        {/* 📚 책 (더 넓음) */}
        <div style={{ flex: 2 }}>
          <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>
            📗 책 대여 현황
          </h2>

          <input
            placeholder="책 / 주인 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          />

          {filteredBooks.map((book) => (
            <div
              key={book.id}
              style={{
                background: "white",
                padding: "14px 18px",
                borderRadius: "12px",
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", fontSize: "15px" }}>
                  {book.title}
                </div>
                <div style={{ fontSize: "12px", color: "#777" }}>
                  👤 {book.owner}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    color: "white",
                    fontSize: "12px",
                    background:
                      book.status === "available" ? "#27ae60" : "#e74c3c",
                  }}
                >
                  {book.status === "available" ? "대여가능" : "대출중"}
                </span>

                <span style={{ fontSize: "12px", width: "60px" }}>
                  {book.borrower || "-"}
                </span>

                <button
                  onClick={() => toggleStatus(book)}
                  style={{
                    background: "#2d3436",
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                >
                  변경
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 🏆 순위 (작게) */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>
            🏆 독서 점수 순위
          </h2>

          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <input
              placeholder="참가자"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{
                flex: 1,
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            />
            <button
              onClick={addParticipant}
              style={{
                background: "#2d3436",
                color: "white",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              추가
            </button>
          </div>

          {sorted.map((p, i) => (
            <div
              key={p.id}
              style={{
                background:
                  i === 0
                    ? "#ffeaa7"
                    : i === 1
                    ? "#dfe6e9"
                    : i === 2
                    ? "#fab1a0"
                    : "white",
                padding: "10px 12px",
                borderRadius: "10px",
                marginBottom: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              {/* 상단 */}
              <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                {getMedal(i)} {p.name}
                <span style={{ float: "right" }}>{getTotal(p)}점</span>
              </div>

              {/* 점수 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  textAlign: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#888" }}>참여</div>
                  <div>{p.participation || 0}</div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ color: "#888" }}>흥행</div>
                  <div>{p.influence || 0}</div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ color: "#888" }}>가산</div>
                  <div>{p.bonus || 0}</div>
                </div>
              </div>

              {/* 관리자 입력 */}
              <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                <input
                  type="number"
                  value={p.participation || 0}
                  onChange={(e) =>
                    updateScore(p.id, "participation", e.target.value)
                  }
                  style={{ width: "40px" }}
                />
                <input
                  type="number"
                  value={p.influence || 0}
                  onChange={(e) =>
                    updateScore(p.id, "influence", e.target.value)
                  }
                  style={{ width: "40px" }}
                />
                <input
                  type="number"
                  value={p.bonus || 0}
                  onChange={(e) =>
                    updateScore(p.id, "bonus", e.target.value)
                  }
                  style={{ width: "40px" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}