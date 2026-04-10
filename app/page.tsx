"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// 타입 정의
type Book = {
  id: number;
  title: string;
  owner: string;
  status: "available" | "borrowed";
  borrower: string | null;
};

type Participant = {
  id: number;
  name: string;
  participation: number;
  influence: number;
  bonus: number;
};

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchBooks();
    fetchParticipants();
  }, []);

  const fetchBooks = async () => {
    const { data, error } = await supabase.from("books").select("*");

    if (error) {
      console.error(error);
      return;
    }

    setBooks((data as Book[]) || []);
  };

  const fetchParticipants = async () => {
    const { data, error } = await supabase.from("participants").select("*");

    if (error) {
      console.error(error);
      return;
    }

    setParticipants((data as Participant[]) || []);
  };

  // 상태 변경
  const toggleStatus = async (book: Book) => {
    const newStatus =
      book.status === "available" ? "borrowed" : "available";

    const { error } = await supabase
      .from("books")
      .update({
        status: newStatus,
        borrower: newStatus === "borrowed" ? "누군가" : null,
      })
      .eq("id", book.id);

    if (error) {
      console.error(error);
      return;
    }

    fetchBooks();
  };

  // 참가자 추가
  const addParticipant = async () => {
    if (!newName.trim()) return;

    const { error } = await supabase.from("participants").insert({
      name: newName,
      participation: 0,
      influence: 0,
      bonus: 0,
    });

    if (error) {
      console.error(error);
      return;
    }

    setNewName("");
    fetchParticipants();
  };

  // 점수 계산
  const sortedParticipants = [...participants]
    .map((p) => ({
      ...p,
      total: p.participation + p.influence + p.bonus,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", fontSize: "32px" }}>
        📚 유일하이스트 독서 챌린지
      </h1>

      <div style={{ display: "flex", gap: "40px", marginTop: "30px" }}>
        
        {/* 책 리스트 */}
        <div style={{ flex: 2 }}>
          <h2>📖 책 대여 현황</h2>

          <input
            placeholder="검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
          />

          {books
            .filter(
              (b) =>
                b.title.includes(search) || b.owner.includes(search)
            )
            .sort((a, b) =>
              a.status === b.status ? 0 : a.status === "borrowed" ? -1 : 1
            )
            .map((book) => (
              <div
                key={book.id}
                style={{
                  background: "#f5f5f5",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <b>{book.title}</b>
                  <div style={{ fontSize: "12px" }}>{book.owner}</div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "20px",
                      color: "white",
                      background:
                        book.status === "available" ? "green" : "red",
                    }}
                  >
                    {book.status === "available" ? "대여가능" : "대출중"}
                  </span>

                  <span>{book.borrower || "-"}</span>

                  <button onClick={() => toggleStatus(book)}>변경</button>
                </div>
              </div>
            ))}
        </div>

        {/* 순위 */}
        <div style={{ flex: 1 }}>
          <h2>🏆 독서 점수 순위</h2>

          {/* 관리자 입력 */}
          <div style={{ marginBottom: "20px" }}>
            <input
              placeholder="이름 추가"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button onClick={addParticipant}>추가</button>
          </div>

          {sortedParticipants.map((p, i) => (
            <div
              key={p.id}
              style={{
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "10px",
                background:
                  i === 0
                    ? "#ffd700"
                    : i === 1
                    ? "#c0c0c0"
                    : i === 2
                    ? "#cd7f32"
                    : "#eee",
              }}
            >
              <b>
                {i + 1}위 {p.name} ({p.total}점)
              </b>

              <div style={{ fontSize: "12px", marginTop: "5px" }}>
                참여({p.participation}) / 흥행({p.influence}) / 가산({p.bonus})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}