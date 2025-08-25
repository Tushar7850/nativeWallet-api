import { sql } from "../config/db.js";

export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;
    
    console.log("User ID received:", req.params.userId);
    const transactions =
      await sql`SELECT * FROM transaction WHERE user_id = ${userId} ORDER BY created_at DESC`;
    console.log("Transactions fetched:", transactions);

    res.status(200).json(transactions);
  } catch (error) {
    console.log("Error creating the transaction", error);
    return res.status(500).json({ message: "internal server error" });
  }
}

export async function createTransaction(req, res) {
  try {
    const { title, amount, category, user_id } = req.body;
    if (!title || amount === undefined || !category || !user_id) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const transaction = await sql`
    INSERT INTO transaction (title, amount, category, user_id)
    VALUES (${title}, ${amount}, ${category}, ${user_id})
    RETURNING *
    `;
    console.log("transaction", transaction);

    res.status(201).json(transaction[0]);
  } catch (error) {
    console.log("Error creating the transaction", error);
    return res.status(500).json({ message: "internal server error" });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const result =
      await sql`DELETE FROM transaction WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.log("Error creating the transaction", error);
    return res.status(500).json({ message: "internal server error" });
  }
}

export async function getSummaryByUserId(req, res) {
  try {
    const { userId } = req.params;
    const balanceResult = await sql`SELECT COALESCE(SUM(amount),0)as balance From transaction WHERE user_id = ${userId}`;

    const incomeResult = await sql`
        SELECT COALESCE(SUM(amount),0)as income From transaction WHERE user_id = ${userId} AND amount > 0
        `;

    const expensesResult = await sql`
        SELECT COALESCE(SUM(amount),0) as expenses From transaction WHERE user_id = ${userId} AND amount < 0
        `;

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expensesResult[0].expenses,
    });
  } catch (error) {
    console.log("Error getting the summary", error);
    return res.status(500).json({ message: "internal server error" });
  }
}
