SELECT name,
  (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) AS order_count
FROM customers ORDER BY order_count DESC LIMIT 10;
