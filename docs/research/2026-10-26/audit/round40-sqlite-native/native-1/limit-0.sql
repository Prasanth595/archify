SELECT name,
  (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) AS order_count
FROM customers LIMIT 0;
