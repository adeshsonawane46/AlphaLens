-- AlphaLens AI Operating System Database Schema

CREATE DATABASE IF NOT EXISTS alphalens;
USE alphalens;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(255),
    current_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    price_change DECIMAL(5, 2) DEFAULT 0.00,
    market_cap VARCHAR(50),
    logo_url VARCHAR(512),
    exchange VARCHAR(50),
    bse_code VARCHAR(50),
    industry VARCHAR(255),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ticker (ticker)
);

-- Analysis Reports table
CREATE TABLE IF NOT EXISTS analysis_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    user_id INT,
    alphalens_score INT NOT NULL,
    ai_confidence INT NOT NULL DEFAULT 85,
    conviction VARCHAR(50) DEFAULT 'Medium',
    time_horizon VARCHAR(50) DEFAULT '12-18 Months',
    risk_level VARCHAR(50) DEFAULT 'Medium',
    verdict TEXT NOT NULL,
    bull_arguments JSON NOT NULL, -- array of pros
    bear_arguments JSON NOT NULL, -- array of cons
    raw_agent_data JSON, -- stores detailed state of each agent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_user (company_id, user_id)
);

-- News Cache table
CREATE TABLE IF NOT EXISTS news_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    headline VARCHAR(512) NOT NULL,
    content TEXT,
    sentiment VARCHAR(20) NOT NULL, -- POSITIVE, CAUTION, NEUTRAL
    source VARCHAR(255) DEFAULT 'SEC EDGAR / NewsFeed',
    url VARCHAR(512),
    published_at VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_news (company_id)
);

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_company (user_id, company_id),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Simulation History table
CREATE TABLE IF NOT EXISTS simulation_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    company_id INT NOT NULL,
    parameters JSON NOT NULL, -- stores revenue, margin, growth, rates, inflation
    result_score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Comparison History table
CREATE TABLE IF NOT EXISTS comparison_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    base_company_id INT NOT NULL,
    compare_company_id INT NOT NULL,
    comparison_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (compare_company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- AI Execution Logs table
CREATE TABLE IF NOT EXISTS ai_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    log_level VARCHAR(20) DEFAULT 'INFO',
    message VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_logs (company_id)
);
