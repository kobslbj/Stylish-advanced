local n = tonumber(ARGV[1])
local order_name = ARGV[2]

if not n  or n == 0 then
    return 0       
end                
local vals = redis.call("HMGET", KEYS[1], "Total", "Booked");
local total = tonumber(vals[1])
local booked = tonumber(vals[2])
if not total or not booked then
    return 0       
end                
if booked + n <= total then
    redis.call("HINCRBY", KEYS[1], "Booked", n) -- 增加n
    redis.call("LPUSH", order_name, ARGV[3])                           
    return n;   
end                 
return 0