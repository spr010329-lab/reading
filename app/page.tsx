// @ts-nocheck
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
    setBooks((data as any[]) || []);
  };

  const fetchParticipants = async () => {
    const { data } = await supabase.from("participants").select("*");
    setParticipants((data as any[]) || []);
  };

  // 🔥 타입 추가
  const toggleStatus = async (book: any) => {
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

  const updateScore = async (id: number, field: string, value: any) => {
    await supabase
      .from("participants")
      .update({ [field]: Number(value) })
      .eq("id", id);

    fetchParticipants();
  };

  const getTotal = (p: any) =>
    Number(p.participation || 0) +
    Number(p.influence || 0) +
    Number(p.bonus || 0);

  const sorted = [...participants].sort(
    (a: any, b: any) => getTotal(b) - getTotal(a)
  );

  const filteredBooks = books.filter(
    (b: any) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.owner.toLowerCase().includes(search.toLowerCase())
  );

  const getMedal = (i: number) => {
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

      <div style={{ display: "flex", gap: "30px" }}>
        
        {/* 📚 책 */}
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

          {filteredBooks.map((book: any) => (
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
                <div style={{ fontWeight: "bold" }}>{book.title}</div>
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

        {/* 🏆 순위 */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>
            🏆 독서 점수 순위
          </h2>

          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <input
              placeholder="참가자"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ flex: 1, padding: "6px" }}
            />
            <button onClick={addParticipant}>추가</button>
          </div>

          {sorted.map((p: any, i: number) => (
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
                padding: "10px",
                borderRadius: "10px",
                marginBottom: "8px",
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                {getMedal(i)} {p.name}
                <span style={{ float: "right" }}>{getTotal(p)}점</span>
              </div>

              <div style={{ display: "flex", fontSize: "11px", marginTop: "4px" }}>
                <div style={{ flex: 1 }}>참여 {p.participation}</div>
                <div style={{ flex: 1 }}>흥행 {p.influence}</div>
                <div style={{ flex: 1 }}>가산 {p.bonus}</div>
              </div>

              <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                <input
                  type="number"
                  value={p.participation}
                  onChange={(e) =>
                    updateScore(p.id, "participation", e.target.value)
                  }
                  style={{ width: "40px" }}
                />
                <input
                  type="number"
                  value={p.influence}
                  onChange={(e) =>
                    updateScore(p.id, "influence", e.target.value)
                  }
                  style={{ width: "40px" }}
                />
                <input
                  type="number"
                  value={p.bonus}
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