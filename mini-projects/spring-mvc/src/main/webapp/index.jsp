<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <title>Spring MVC App</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .card {
            background: #1e293b;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            text-align: center;
            width: 320px;
            border: 1px solid #334155;
        }
        h2 {
            color: #38bdf8;
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 24px;
        }
        p {
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 24px;
        }
        .count-display {
            font-size: 48px;
            font-weight: bold;
            margin: 20px 0;
            color: #4ade80;
        }
        .btn-container {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        button {
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            flex: 1;
        }
        .btn-primary {
            background-color: #38bdf8;
            color: #0f172a;
        }
        .btn-primary:hover {
            background-color: #7dd3fc;
        }
        .btn-danger {
            background-color: #f43f5e;
            color: #ffffff;
        }
        .btn-danger:hover {
            background-color: #fb7185;
        }
    </style>
</head>
<body>

<div class="card">
    <h2>Spring MVC Dashboard</h2>
    <p>Welcome to the custom web application!</p>
    
    <div class="count-display" id="counter">0</div>
    
    <div class="btn-container">
        <button class="btn-primary" onclick="increase()">Increment</button>
        <button class="btn-danger" onclick="reset()">Reset</button>
    </div>
</div>

<script>
    let count = 0;
    function increase() {
        count++;
        document.getElementById('counter').innerText = count;
    }
    function reset() {
        count = 0;
        document.getElementById('counter').innerText = count;
    }
</script>

</body>
</html>