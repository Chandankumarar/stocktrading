DELIMITER //

CREATE TRIGGER before_stock_insert
BEFORE INSERT ON stocks
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM stocks WHERE stockname = NEW.stockname) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock name already exists';
    END IF;
END //

DELIMITER ;
