export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

export interface CodeTemplate {
  javascript: string;
  typescript: string;
  python: string;
  sql?: string;
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: "Arrays & Hashing" | "Two Pointers" | "Sliding Window" | "Stack" | "Dynamic Programming" | "Trees & Graphs" | "System Design" | "SQL";
  acceptanceRate: number; // e.g. 52.4
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  templates: CodeTemplate;
  testCases: TestCase[];
  hints: string[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: "two-sum",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    acceptanceRate: 54.2,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]"
      }
    ],
    templates: {
      javascript: `function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  // Write your code here
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Write your code here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
    },
    testCases: [
      { id: 1, input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
      { id: 2, input: "[3,2,4], 6", expectedOutput: "[1,2]" },
      { id: 3, input: "[3,3], 6", expectedOutput: "[0,1]" },
      { id: 4, input: "[1,5,8,3,9], 11", expectedOutput: "[2,3]", isHidden: true }
    ],
    hints: [
      "A brute force approach checks all pairs in O(N^2) time.",
      "Can we use a Hash Map to check if the complement (target - current) exists in O(1) time?",
      "Store each number's value as the key and its index as the value while iterating."
    ]
  },
  {
    id: "lru-cache",
    slug: "lru-cache",
    title: "LRU Cache (Least Recently Used)",
    difficulty: "Medium",
    category: "System Design",
    acceptanceRate: 42.8,
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\` Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, **evict the least recently used key**.

The functions \`get\` and \`put\` must each run in **O(1) average time complexity**.`,
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls will be made to get and put."
    ],
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
        explanation: "LRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1); // cache is {1=1}\nlRUCache.put(2, 2); // cache is {1=1, 2=2}\nlRUCache.get(1);    // return 1\nlRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}\nlRUCache.get(2);    // returns -1 (not found)\nlRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}\nlRUCache.get(1);    // return -1 (not found)\nlRUCache.get(3);    // return 3\nlRUCache.get(4);    // return 4"
      }
    ],
    templates: {
      javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}`,
      typescript: `class LRUCache {
  private capacity: number;
  private cache: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value!;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            first_key = next(iter(self.cache))
            del self.cache[first_key]
        self.cache[key] = value`
    },
    testCases: [
      {
        id: 1,
        input: 'operations: ["put(1,1)", "put(2,2)", "get(1)", "put(3,3)", "get(2)"]',
        expectedOutput: "[null, null, 1, null, -1]"
      },
      {
        id: 2,
        input: 'capacity: 1, operations: ["put(2,1)", "get(2)", "put(3,2)", "get(2)", "get(3)"]',
        expectedOutput: "[null, 1, null, -1, 2]"
      }
    ],
    hints: [
      "JavaScript's Map preserves insertion order, allowing O(1) eviction using the iterator keys.",
      "In general languages, combine a Hash Map with a Doubly Linked List for true O(1) get and put.",
      "Whenever a key is accessed via get() or put(), move its node to the head of the list."
    ]
  },
  {
    id: "valid-parentheses",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    acceptanceRate: 40.5,
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" }
    ],
    templates: {
      javascript: `function isValid(s) {
  // Write your code here
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const ch of s) {
    if (ch in map) {
      if (stack.pop() !== map[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}`,
      typescript: `function isValid(s: string): boolean {
  // Write your code here
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const ch of s) {
    if (ch in map) {
      if (stack.pop() !== map[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}`,
      python: `def is_valid(s: str) -> bool:
    # Write your code here
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in pairs:
            if not stack or stack.pop() != pairs[char]:
                return False
        else:
            stack.append(char)
    return len(stack) == 0`
    },
    testCases: [
      { id: 1, input: '"()"', expectedOutput: "true" },
      { id: 2, input: '"()[]{}"', expectedOutput: "true" },
      { id: 3, input: '"(]"', expectedOutput: "false" },
      { id: 4, input: '"{[]}"', expectedOutput: "true" },
      { id: 5, input: '"([)]"', expectedOutput: "false", isHidden: true }
    ],
    hints: [
      "Use a Last-In-First-Out (LIFO) stack to match opening brackets with the most recent unmatched opening bracket.",
      "If you encounter a closing bracket and the top of the stack does not match, return false immediately."
    ]
  },
  {
    id: "coin-change",
    slug: "coin-change",
    title: "Coin Change (Fewest Coins)",
    difficulty: "Medium",
    category: "Dynamic Programming",
    acceptanceRate: 43.1,
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    constraints: [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4"
    ],
    examples: [
      {
        input: "coins = [1,2,5], amount = 11",
        output: "3",
        explanation: "11 = 5 + 5 + 1"
      },
      {
        input: "coins = [2], amount = 3",
        output: "-1"
      },
      {
        input: "coins = [1], amount = 0",
        output: "0"
      }
    ],
    templates: {
      javascript: `function coinChange(coins, amount) {
  // Write your code here
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      typescript: `function coinChange(coins: number[], amount: number): number {
  // Write your code here
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      python: `def coin_change(coins: list[int], amount: int) -> int:
    # Write your code here
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if i - coin >= 0:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`
    },
    testCases: [
      { id: 1, input: "[1,2,5], 11", expectedOutput: "3" },
      { id: 2, input: "[2], 3", expectedOutput: "-1" },
      { id: 3, input: "[1], 0", expectedOutput: "0" },
      { id: 4, input: "[186,419,83,408], 6249", expectedOutput: "20", isHidden: true }
    ],
    hints: [
      "Let dp[i] be the minimum coins needed to make amount i.",
      "Base case: dp[0] = 0.",
      "Transition: dp[i] = min(dp[i - c] + 1) for all coins c where i - c >= 0."
    ]
  },
  {
    id: "longest-substring-without-repeating-characters",
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    acceptanceRate: 34.9,
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation: 'The answer is "wke", with the length of 3.'
      }
    ],
    templates: {
      javascript: `function lengthOfLongestSubstring(s) {
  // Write your code here
  let maxLen = 0;
  let left = 0;
  const seen = new Map();
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (seen.has(char) && seen.get(char) >= left) {
      left = seen.get(char) + 1;
    }
    seen.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      typescript: `function lengthOfLongestSubstring(s: string): number {
  // Write your code here
  let maxLen = 0;
  let left = 0;
  const seen = new Map<string, number>();
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (seen.has(char) && seen.get(char)! >= left) {
      left = seen.get(char)! + 1;
    }
    seen.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      python: `def length_of_longest_substring(s: str) -> int:
    # Write your code here
    seen = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        if char in seen and seen[char] >= left:
            left = seen[char] + 1
        seen[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`
    },
    testCases: [
      { id: 1, input: '"abcabcbb"', expectedOutput: "3" },
      { id: 2, input: '"bbbbb"', expectedOutput: "1" },
      { id: 3, input: '"pwwkew"', expectedOutput: "3" },
      { id: 4, input: '""', expectedOutput: "0" },
      { id: 5, input: '"tmmzuxt"', expectedOutput: "5", isHidden: true }
    ],
    hints: [
      "Use a sliding window [left, right].",
      "Maintain a Hash Map of the most recent index where each character appeared.",
      "When a duplicate is encountered, slide the left pointer past its previous index."
    ]
  },
  {
    id: "rate-limiter-token-bucket",
    slug: "rate-limiter-token-bucket",
    title: "Token Bucket Rate Limiter",
    difficulty: "Medium",
    category: "System Design",
    acceptanceRate: 48.5,
    description: `Implement a **Token Bucket Rate Limiter** class that restricts the frequency of client requests.

The token bucket has a maximum \`capacity\` and refills at a constant \`refillRatePerSecond\` tokens per second.

Implement \`RateLimiter\`:
- \`constructor(capacity, refillRatePerSecond)\`: Initializes the bucket.
- \`allowRequest(tokensRequired = 1, currentTimestampMs)\`: Returns \`true\` if enough tokens are available and consumes them, otherwise returns \`false\`.`,
    constraints: [
      "1 <= capacity <= 10^6",
      "1 <= refillRatePerSecond <= 10^5",
      "Timestamps are strictly non-decreasing."
    ],
    examples: [
      {
        input: "capacity = 5, refillRate = 1 token/sec\nallowRequest(3, 1000) -> true (2 remaining)\nallowRequest(3, 1500) -> false (only ~2.5 tokens available)\nallowRequest(3, 3000) -> true",
        output: "[true, false, true]"
      }
    ],
    templates: {
      javascript: `class TokenBucketRateLimiter {
  constructor(capacity, refillRatePerSecond) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSecond;
    this.tokens = capacity;
    this.lastRefillTimestamp = 0;
  }

  allowRequest(tokens = 1, timestampMs = Date.now()) {
    if (this.lastRefillTimestamp === 0) {
      this.lastRefillTimestamp = timestampMs;
    } else {
      const elapsedSeconds = (timestampMs - this.lastRefillTimestamp) / 1000;
      this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillRate);
      this.lastRefillTimestamp = timestampMs;
    }

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
}`,
      typescript: `class TokenBucketRateLimiter {
  private capacity: number;
  private refillRate: number;
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(capacity: number, refillRatePerSecond: number) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSecond;
    this.tokens = capacity;
    this.lastRefillTimestamp = 0;
  }

  allowRequest(tokens: number = 1, timestampMs: number = Date.now()): boolean {
    if (this.lastRefillTimestamp === 0) {
      this.lastRefillTimestamp = timestampMs;
    } else {
      const elapsedSeconds = (timestampMs - this.lastRefillTimestamp) / 1000;
      this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillRate);
      this.lastRefillTimestamp = timestampMs;
    }

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
}`,
      python: `class TokenBucketRateLimiter:
    def __init__(self, capacity: int, refill_rate_per_second: float):
        self.capacity = capacity
        self.refill_rate = refill_rate_per_second
        self.tokens = capacity
        self.last_refill_timestamp = 0.0

    def allow_request(self, tokens: int = 1, timestamp_ms: float = 0.0) -> bool:
        if self.last_refill_timestamp == 0.0:
            self.last_refill_timestamp = timestamp_ms
        else:
            elapsed_seconds = (timestamp_ms - self.last_refill_timestamp) / 1000.0
            self.tokens = min(float(self.capacity), self.tokens + elapsed_seconds * self.refill_rate)
            self.last_refill_timestamp = timestamp_ms

        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False`
    },
    testCases: [
      {
        id: 1,
        input: "capacity: 5, refill: 1 token/s, calls: [(3, 1000), (3, 1500), (3, 3000)]",
        expectedOutput: "[true, false, true]"
      }
    ],
    hints: [
      "Calculate tokens to add as: elapsedSeconds * refillRatePerSecond.",
      "Cap tokens at the max capacity.",
      "Update lastRefillTimestamp to the current timestamp on every request check."
    ]
  },
  {
    id: "number-of-islands",
    slug: "number-of-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    category: "Trees & Graphs",
    acceptanceRate: 57.8,
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return *the number of islands*.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'."
    ],
    examples: [
      {
        input: `grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]`,
        output: "1"
      },
      {
        input: `grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]`,
        output: "3"
      }
    ],
    templates: {
      javascript: `function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;
  let count = 0;
  const rows = grid.length;
  const cols = grid[0].length;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0"; // Mark as visited
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}`,
      typescript: `function numIslands(grid: string[][]): number {
  if (!grid || grid.length === 0) return 0;
  let count = 0;
  const rows = grid.length;
  const cols = grid[0].length;

  function dfs(r: number, c: number) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0"; // Mark as visited
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}`,
      python: `def num_islands(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count`
    },
    testCases: [
      {
        id: 1,
        input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        expectedOutput: "1"
      },
      {
        id: 2,
        input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        expectedOutput: "3"
      }
    ],
    hints: [
      "Iterate through every cell in the grid.",
      "When a '1' is encountered, increment your island counter and trigger a DFS/BFS to sink/mark all connected '1's as '0'."
    ]
  }
];
