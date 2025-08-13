-- Add sample trading pairs for CEX functionality

-- Insert sample trading pairs
INSERT INTO "trading_pairs" (
    "symbol", 
    "base_asset", 
    "quote_asset", 
    "current_price", 
    "price_change_24h", 
    "price_change_percent_24h", 
    "high_24h", 
    "low_24h", 
    "volume_24h"
) VALUES 
    ('BTC/USDT', 'BTC', 'USDT', 118275.31, 1250.45, 1.07, 119500.00, 116800.00, 2847500000.50),
    ('ETH/USDT', 'ETH', 'USDT', 3245.67, -45.23, -1.37, 3350.00, 3200.00, 1850000000.25),
    ('SOL/USDT', 'SOL', 'USDT', 145.89, 8.76, 6.38, 150.00, 135.00, 450000000.75),
    ('ADA/USDT', 'ADA', 'USDT', 0.4856, -0.0123, -2.47, 0.5000, 0.4700, 125000000.00),
    ('DOT/USDT', 'DOT', 'USDT', 7.2345, 0.1567, 2.22, 7.5000, 7.0000, 89000000.50),
    ('MATIC/USDT', 'MATIC', 'USDT', 0.8765, 0.0234, 2.75, 0.9000, 0.8500, 67000000.25),
    ('LINK/USDT', 'LINK', 'USDT', 15.6789, -0.3456, -2.15, 16.2000, 15.3000, 45000000.75),
    ('UNI/USDT', 'UNI', 'USDT', 8.4567, 0.1234, 1.48, 8.7000, 8.2000, 34000000.50),
    ('AVAX/USDT', 'AVAX', 'USDT', 28.9012, 1.2345, 4.47, 30.0000, 27.5000, 28000000.25),
    ('ATOM/USDT', 'ATOM', 'USDT', 9.8765, -0.2345, -2.32, 10.2000, 9.6000, 22000000.75)
ON CONFLICT ("symbol") DO NOTHING;

-- Add some sample order book entries
INSERT INTO "order_book_entries" (
    "symbol", 
    "side", 
    "price", 
    "quantity"
) VALUES 
    ('BTC/USDT', 'buy', 118270.00, 0.5),
    ('BTC/USDT', 'buy', 118265.00, 1.2),
    ('BTC/USDT', 'buy', 118260.00, 0.8),
    ('BTC/USDT', 'sell', 118280.00, 0.3),
    ('BTC/USDT', 'sell', 118285.00, 1.1),
    ('BTC/USDT', 'sell', 118290.00, 0.7),
    ('ETH/USDT', 'buy', 3240.00, 2.5),
    ('ETH/USDT', 'buy', 3235.00, 3.8),
    ('ETH/USDT', 'sell', 3250.00, 1.9),
    ('ETH/USDT', 'sell', 3255.00, 2.7)
ON CONFLICT DO NOTHING;

-- Add some sample trades
INSERT INTO "trades" (
    "symbol", 
    "price", 
    "quantity", 
    "side"
) VALUES 
    ('BTC/USDT', 118275.31, 0.1, 'buy'),
    ('BTC/USDT', 118274.50, 0.05, 'sell'),
    ('ETH/USDT', 3245.67, 1.5, 'buy'),
    ('ETH/USDT', 3244.80, 0.8, 'sell'),
    ('SOL/USDT', 145.89, 10.0, 'buy'),
    ('SOL/USDT', 145.75, 5.5, 'sell')
ON CONFLICT DO NOTHING;
