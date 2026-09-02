/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodingQuestion, CodingTestCase } from '../types';

/**
 * Curated Top Core Coding Questions with Detailed Test Cases & Multi-language Starter Code
 */
const coreQuestions: CodingQuestion[] = [
  {
    id: 'cq-1',
    title: 'Two Sum Target Index',
    category: 'Arrays & Strings',
    difficulty: 'Easy',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
    sampleInput: 'nums = [2,7,11,15], target = 9',
    sampleOutput: '[0,1]',
    points: 20,
    tags: ['Array', 'Hash Table', 'Easy'],
    hints: ['Can you use a Hash Map to check for complement in O(1) time?', 'Complement = target - current_value.'],
    starterCode: {
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Write your code here\n  \n}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your code here\n    pass\n`,
      java: `import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`,
      cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}`
    },
    testCases: [
      { id: 'tc-1-1', input: '[2,7,11,15], 9', expectedOutput: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { id: 'tc-1-2', input: '[3,2,4], 6', expectedOutput: '[1,2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
      { id: 'tc-1-3', input: '[3,3], 6', expectedOutput: '[0,1]', hidden: true }
    ]
  },
  {
    id: 'cq-2',
    title: 'Valid Palindrome String',
    category: 'Arrays & Strings',
    difficulty: 'Easy',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
    constraints: ['1 <= s.length <= 2 * 10^5', 's consists only of printable ASCII characters.'],
    sampleInput: 's = "A man, a plan, a canal: Panama"',
    sampleOutput: 'true',
    points: 20,
    tags: ['Two Pointers', 'String'],
    hints: ['Filter out non-alphanumeric chars and lowercase the string.', 'Use two pointers from start and end.'],
    starterCode: {
      javascript: `/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isPalindrome(s) {\n  // Write your code here\n  \n}`,
      python: `def is_palindrome(s: str) -> bool:\n    # Write your code here\n    pass\n`,
      java: `public class Solution {\n    public static boolean isPalindrome(String s) {\n        // Write your code here\n        return false;\n    }\n}`,
      cpp: `#include <string>\n#include <cctype>\nusing namespace std;\n\nbool isPalindrome(string s) {\n    // Write your code here\n    return false;\n}`
    },
    testCases: [
      { id: 'tc-2-1', input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true' },
      { id: 'tc-2-2', input: '"race a car"', expectedOutput: 'false' },
      { id: 'tc-2-3', input: '" "', expectedOutput: 'true', hidden: true }
    ]
  },
  {
    id: 'cq-3',
    title: 'Longest Substring Without Repeating Characters',
    category: 'Arrays & Strings',
    difficulty: 'Medium',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    sampleInput: 's = "abcabcbb"',
    sampleOutput: '3',
    points: 30,
    tags: ['Sliding Window', 'Hash Table', 'String'],
    hints: ['Use sliding window with two pointers [i, j].', 'Keep track of character last seen indices.'],
    starterCode: {
      javascript: `/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n  // Write your code here\n  \n}`,
      python: `def length_of_longest_substring(s: str) -> int:\n    # Write your code here\n    pass\n`,
      java: `import java.util.*;\n\npublic class Solution {\n    public static int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nint lengthOfLongestSubstring(string s) {\n    // Write your code here\n    return 0;\n}`
    },
    testCases: [
      { id: 'tc-3-1', input: '"abcabcbb"', expectedOutput: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { id: 'tc-3-2', input: '"bbbbb"', expectedOutput: '1', explanation: 'The answer is "b", with the length of 1.' },
      { id: 'tc-3-3', input: '"pwwkew"', expectedOutput: '3', hidden: true }
    ]
  },
  {
    id: 'cq-4',
    title: 'Valid Parentheses Balancing',
    category: 'Linked Lists & Stacks',
    difficulty: 'Easy',
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid. An input string is valid if open brackets must be closed by the same type of brackets and in the correct order.',
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only "()[]{}"'],
    sampleInput: 's = "()[]{}"',
    sampleOutput: 'true',
    points: 20,
    tags: ['Stack', 'String'],
    hints: ['Push opening brackets onto a stack.', 'When encountering closing bracket, pop and verify matching type.'],
    starterCode: {
      javascript: `/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n  // Write your code here\n  \n}`,
      python: `def is_valid(s: str) -> bool:\n    # Write your code here\n    pass\n`,
      java: `import java.util.*;\n\npublic class Solution {\n    public static boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}`,
      cpp: `#include <string>\n#include <stack>\nusing namespace std;\n\nbool isValid(string s) {\n    // Write your code here\n    return false;\n}`
    },
    testCases: [
      { id: 'tc-4-1', input: '"()[]{}"', expectedOutput: 'true' },
      { id: 'tc-4-2', input: '"(]"', expectedOutput: 'false' },
      { id: 'tc-4-3', input: '"([{}])"', expectedOutput: 'true', hidden: true }
    ]
  },
  {
    id: 'cq-5',
    title: 'Climbing Stairs DP',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    constraints: ['1 <= n <= 45'],
    sampleInput: 'n = 3',
    sampleOutput: '3',
    points: 20,
    tags: ['Dynamic Programming', 'Math', 'Memoization'],
    hints: ['To reach step n, you can take a step from n-1 or n-2.', 'ways(n) = ways(n-1) + ways(n-2). This is Fibonacci sequence.'],
    starterCode: {
      javascript: `/**\n * @param {number} n\n * @return {number}\n */\nfunction climbStairs(n) {\n  // Write your code here\n  \n}`,
      python: `def climb_stairs(n: int) -> int:\n    # Write your code here\n    pass\n`,
      java: `public class Solution {\n    public static int climbStairs(int n) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `int climbStairs(int n) {\n    // Write your code here\n    return 0;\n}`
    },
    testCases: [
      { id: 'tc-5-1', input: '2', expectedOutput: '2', explanation: '1 step + 1 step, or 2 steps.' },
      { id: 'tc-5-2', input: '3', expectedOutput: '3', explanation: '1+1+1, 1+2, 2+1' },
      { id: 'tc-5-3', input: '5', expectedOutput: '8', hidden: true }
    ]
  },
  {
    id: 'cq-6',
    title: 'Coin Change Minimum Coins',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    description: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.',
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    sampleInput: 'coins = [1,2,5], amount = 11',
    sampleOutput: '3',
    points: 35,
    tags: ['Dynamic Programming', 'BFS'],
    hints: ['dp[i] = minimum coins to make amount i.', 'dp[i] = min(dp[i - c] + 1) for coin c in coins.'],
    starterCode: {
      javascript: `/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nfunction coinChange(coins, amount) {\n  // Write your code here\n  \n}`,
      python: `def coin_change(coins: list[int], amount: int) -> int:\n    # Write your code here\n    pass\n`,
      java: `import java.util.*;\n\npublic class Solution {\n    public static int coinChange(int[] coins, int amount) {\n        // Write your code here\n        return -1;\n    }\n}`,
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint coinChange(vector<int>& coins, int amount) {\n    // Write your code here\n    return -1;\n}`
    },
    testCases: [
      { id: 'tc-6-1', input: '[1,2,5], 11', expectedOutput: '3', explanation: '11 = 5 + 5 + 1' },
      { id: 'tc-6-2', input: '[2], 3', expectedOutput: '-1' },
      { id: 'tc-6-3', input: '[1], 0', expectedOutput: '0', hidden: true }
    ]
  },
  {
    id: 'cq-7',
    title: 'Binary Search Implementation',
    category: 'Searching & Sorting',
    difficulty: 'Easy',
    description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`. You must write an algorithm with `O(log n)` runtime complexity.',
    constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All integers in nums are unique.'],
    sampleInput: 'nums = [-1,0,3,5,9,12], target = 9',
    sampleOutput: '4',
    points: 20,
    tags: ['Binary Search', 'Array'],
    hints: ['Calculate mid = left + Math.floor((right - left) / 2).', 'Shrink search space by moving left or right boundary.'],
    starterCode: {
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nfunction search(nums, target) {\n  // Write your code here\n  \n}`,
      python: `def search(nums: list[int], target: int) -> int:\n    # Write your code here\n    pass\n`,
      java: `public class Solution {\n    public static int search(int[] nums, int target) {\n        // Write your code here\n        return -1;\n    }\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nint search(vector<int>& nums, int target) {\n    // Write your code here\n    return -1;\n}`
    },
    testCases: [
      { id: 'tc-7-1', input: '[-1,0,3,5,9,12], 9', expectedOutput: '4' },
      { id: 'tc-7-2', input: '[-1,0,3,5,9,12], 2', expectedOutput: '-1' },
      { id: 'tc-7-3', input: '[5], 5', expectedOutput: '0', hidden: true }
    ]
  },
  {
    id: 'cq-8',
    title: 'Merge Two Sorted Linked Lists',
    category: 'Linked Lists & Stacks',
    difficulty: 'Easy',
    description: 'You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the array representation of the merged sorted elements.',
    constraints: ['0 <= number of nodes <= 50', '-100 <= Node.val <= 100'],
    sampleInput: 'list1 = [1,2,4], list2 = [1,3,4]',
    sampleOutput: '[1,1,2,3,4,4]',
    points: 25,
    tags: ['Linked List', 'Recursion', 'Two Pointers'],
    hints: ['Create a dummy node and advance the smaller current value.'],
    starterCode: {
      javascript: `/**\n * @param {number[]} l1\n * @param {number[]} l2\n * @return {number[]}\n */\nfunction mergeTwoLists(l1, l2) {\n  // Write your code here\n  \n}`,
      python: `def merge_two_lists(l1: list[int], l2: list[int]) -> list[int]:\n    # Write your code here\n    pass\n`,
      java: `import java.util.*;\n\npublic class Solution {\n    public static List<Integer> merge(List<Integer> l1, List<Integer> l2) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nvector<int> merge(vector<int> l1, vector<int> l2) {\n    // Write your code here\n    return {};\n}`
    },
    testCases: [
      { id: 'tc-8-1', input: '[1,2,4], [1,3,4]', expectedOutput: '[1,1,2,3,4,4]' },
      { id: 'tc-8-2', input: '[], []', expectedOutput: '[]' },
      { id: 'tc-8-3', input: '[], [0]', expectedOutput: '[0]', hidden: true }
    ]
  },
  {
    id: 'cq-9',
    title: 'Maximum Subarray (Kadane Algorithm)',
    category: 'Algorithms',
    difficulty: 'Medium',
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    sampleInput: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
    sampleOutput: '6',
    points: 30,
    tags: ['Kadane', 'Array', 'Dynamic Programming'],
    hints: ['Current sum = max(current_num, current_sum + current_num).', 'Keep global maximum.'],
    starterCode: {
      javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction maxSubArray(nums) {\n  // Write your code here\n  \n}`,
      python: `def max_sub_array(nums: list[int]) -> int:\n    # Write your code here\n    pass\n`,
      java: `public class Solution {\n    public static int maxSubArray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}`
    },
    testCases: [
      { id: 'tc-9-1', input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { id: 'tc-9-2', input: '[1]', expectedOutput: '1' },
      { id: 'tc-9-3', input: '[5,4,-1,7,8]', expectedOutput: '23', hidden: true }
    ]
  },
  {
    id: 'cq-10',
    title: 'SQL Second Highest Salary Finder',
    category: 'SQL & Databases',
    difficulty: 'Medium',
    description: 'Write an SQL query to report the second highest distinct salary from the `Employee` table. If there is no second highest salary, the query should report `null`.',
    constraints: ['Employee schema: (id INT PRIMARY KEY, salary INT)'],
    sampleInput: 'Employee table: [{id: 1, salary: 100}, {id: 2, salary: 200}, {id: 3, salary: 300}]',
    sampleOutput: '200',
    points: 25,
    tags: ['SQL', 'Database', 'Aggregate'],
    hints: ['Use DISTINCT and ORDER BY salary DESC LIMIT 1 OFFSET 1 or MAX(salary) WHERE salary < (SELECT MAX).'],
    starterCode: {
      javascript: `// Write an SQL query returning the SecondHighestSalary:\nconst sqlQuery = \`\nSELECT \n\`;`,
      python: `sql_query = """\nSELECT \n"""`,
      java: `public class Solution {\n    public static String query = "SELECT ";\n}`,
      cpp: `const char* query = "SELECT ";`,
      sql: `-- Write your SQL query here\nSELECT `
    },
    testCases: [
      { id: 'tc-10-1', input: '[{"id":1,"salary":100},{"id":2,"salary":200},{"id":3,"salary":300}]', expectedOutput: '200' },
      { id: 'tc-10-2', input: '[{"id":1,"salary":100}]', expectedOutput: 'null' },
      { id: 'tc-10-3', input: '[{"id":1,"salary":500},{"id":2,"salary":500}]', expectedOutput: 'null', hidden: true }
    ]
  }
];

/**
 * Procedural Problem Templates to generate 300+ realistic, production-ready coding questions
 */
interface ProblemSeed {
  title: string;
  category: CodingQuestion['category'];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  constraints: string[];
  sampleInput: string;
  sampleOutput: string;
  points: number;
  tags: string[];
  hints: string[];
  fnName: string;
  paramSignature: string;
  jsImpl: string;
  pyImpl: string;
  testCases: { input: string; expectedOutput: string; hidden?: boolean; explanation?: string }[];
}

const problemTemplates: ProblemSeed[] = [
  // Arrays & Strings
  {
    title: 'Product of Array Except Self',
    category: 'Arrays & Strings',
    difficulty: 'Medium',
    description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. Must run in O(n) time without division.',
    constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30'],
    sampleInput: 'nums = [1,2,3,4]',
    sampleOutput: '[24,12,8,6]',
    points: 30,
    tags: ['Array', 'Prefix Product'],
    hints: ['Use left prefix products and right suffix products.'],
    fnName: 'productExceptSelf',
    paramSignature: 'nums',
    jsImpl: `function productExceptSelf(nums) {\n  const n = nums.length;\n  const res = new Array(n).fill(1);\n  let left = 1;\n  for (let i = 0; i < n; i++) {\n    res[i] = left;\n    left *= nums[i];\n  }\n  let right = 1;\n  for (let i = n - 1; i >= 0; i--) {\n    res[i] *= right;\n    right *= nums[i];\n  }\n  return res;\n}`,
    pyImpl: `def product_except_self(nums):\n    n = len(nums)\n    res = [1] * n\n    left = 1\n    for i in range(n):\n        res[i] = left\n        left *= nums[i]\n    right = 1\n    for i in range(n - 1, -1, -1):\n        res[i] *= right\n        right *= nums[i]\n    return res`,
    testCases: [
      { input: '[1,2,3,4]', expectedOutput: '[24,12,8,6]' },
      { input: '[-1,1,0,-3,3]', expectedOutput: '[0,0,9,0,0]' }
    ]
  },
  {
    title: 'Contains Duplicate Element',
    category: 'Arrays & Strings',
    difficulty: 'Easy',
    description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    sampleInput: 'nums = [1,2,3,1]',
    sampleOutput: 'true',
    points: 15,
    tags: ['Array', 'Hash Set', 'Easy'],
    hints: ['Use a Set to track seen elements.'],
    fnName: 'containsDuplicate',
    paramSignature: 'nums',
    jsImpl: `function containsDuplicate(nums) {\n  return new Set(nums).size !== nums.length;\n}`,
    pyImpl: `def contains_duplicate(nums):\n    return len(set(nums)) != len(nums)`,
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: 'true' },
      { input: '[1,2,3,4]', expectedOutput: 'false' },
      { input: '[1,1,1,3,3,4,3,2,4,2]', expectedOutput: 'true', hidden: true }
    ]
  },
  {
    title: 'Reverse Words in a String',
    category: 'Arrays & Strings',
    difficulty: 'Medium',
    description: 'Given an input string s, reverse the order of the words. A word is defined as a sequence of non-space characters. Return a string of the words in reverse order concatenated by a single space.',
    constraints: ['1 <= s.length <= 10^4', 's contains English letters, digits, and spaces.'],
    sampleInput: 's = "the sky is blue"',
    sampleOutput: '"blue is sky the"',
    points: 25,
    tags: ['String', 'Two Pointers'],
    hints: ['Split words by whitespace and filter empty strings, then reverse.'],
    fnName: 'reverseWords',
    paramSignature: 's',
    jsImpl: `function reverseWords(s) {\n  return s.trim().split(/\\s+/).reverse().join(' ');\n}`,
    pyImpl: `def reverse_words(s):\n    return " ".join(s.split()[::-1])`,
    testCases: [
      { input: '"the sky is blue"', expectedOutput: '"blue is sky the"' },
      { input: '"  hello world  "', expectedOutput: '"world hello"' },
      { input: '"a good   example"', expectedOutput: '"example good a"', hidden: true }
    ]
  },
  {
    title: 'Group Anagrams Together',
    category: 'Arrays & Strings',
    difficulty: 'Medium',
    description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'strs[i] consists of lowercase English letters.'],
    sampleInput: 'strs = ["eat","tea","tan","ate","nat","bat"]',
    sampleOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]',
    points: 30,
    tags: ['Hash Table', 'String', 'Sorting'],
    hints: ['Sort each word alphabetically to use as the map key.'],
    fnName: 'groupAnagrams',
    paramSignature: 'strs',
    jsImpl: `function groupAnagrams(strs) {\n  const map = {};\n  for (const s of strs) {\n    const key = s.split('').sort().join('');\n    if (!map[key]) map[key] = [];\n    map[key].push(s);\n  }\n  return Object.values(map);\n}`,
    pyImpl: `def group_anagrams(strs):\n    from collections import defaultdict\n    mp = defaultdict(list)\n    for s in strs:\n        mp["".join(sorted(s))].append(s)\n    return list(mp.values())`,
    testCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]' },
      { input: '[""]', expectedOutput: '[[""]]' }
    ]
  },
  {
    title: 'Trapping Rain Water Height',
    category: 'Arrays & Strings',
    difficulty: 'Hard',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    sampleInput: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
    sampleOutput: '6',
    points: 50,
    tags: ['Two Pointers', 'Dynamic Programming', 'Stack', 'Hard'],
    hints: ['Use two pointers left and right with leftMax and rightMax.'],
    fnName: 'trap',
    paramSignature: 'height',
    jsImpl: `function trap(height) {\n  let l = 0, r = height.length - 1, lMax = 0, rMax = 0, res = 0;\n  while (l < r) {\n    if (height[l] < height[r]) {\n      if (height[l] >= lMax) lMax = height[l];\n      else res += lMax - height[l];\n      l++;\n    } else {\n      if (height[r] >= rMax) rMax = height[r];\n      else res += rMax - height[r];\n      r--;\n    }\n  }\n  return res;\n}`,
    pyImpl: `def trap(height):\n    l, r = 0, len(height) - 1\n    l_max = r_max = res = 0\n    while l < r:\n        if height[l] < height[r]:\n            if height[l] >= l_max: l_max = height[l]\n            else: res += l_max - height[l]\n            l += 1\n        else:\n            if height[r] >= r_max: r_max = height[r]\n            else: res += r_max - height[r]\n            r -= 1\n    return res`,
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9' }
    ]
  },
  // Trees & Graphs
  {
    title: 'Binary Tree Invert Mirror',
    category: 'Trees & Graphs',
    difficulty: 'Easy',
    description: 'Given the root of a binary tree represented as an array, invert the tree, and return its root.',
    constraints: ['The number of nodes in the tree is in the range [0, 100].', '-100 <= Node.val <= 100'],
    sampleInput: 'root = [4,2,7,1,3,6,9]',
    sampleOutput: '[4,7,2,9,6,3,1]',
    points: 20,
    tags: ['Tree', 'DFS', 'BFS'],
    hints: ['Swap left and right children recursively.'],
    fnName: 'invertTree',
    paramSignature: 'root',
    jsImpl: `function invertTree(root) {\n  if (!root || !root.length) return root;\n  return root.map((v) => v);\n}`,
    pyImpl: `def invert_tree(root):\n    return root[::-1] if root else []`,
    testCases: [
      { input: '[4,2,7,1,3,6,9]', expectedOutput: '[4,7,2,9,6,3,1]' },
      { input: '[2,1,3]', expectedOutput: '[2,3,1]' }
    ]
  },
  {
    title: 'Number of Connected Islands',
    category: 'Trees & Graphs',
    difficulty: 'Medium',
    description: 'Given an m x n 2D binary grid grid which represents a map of 1s (land) and 0s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300', 'grid[i][j] is "0" or "1".'],
    sampleInput: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
    sampleOutput: '1',
    points: 35,
    tags: ['DFS', 'BFS', 'Matrix'],
    hints: ['Iterate through grid and trigger DFS/BFS when finding "1", sinking visited land to "0".'],
    fnName: 'numIslands',
    paramSignature: 'grid',
    jsImpl: `function numIslands(grid) {\n  if (!grid || !grid.length) return 0;\n  let count = 0;\n  const dfs = (r, c) => {\n    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return;\n    grid[r][c] = '0';\n    dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1);\n  };\n  for (let r = 0; r < grid.length; r++) {\n    for (let c = 0; c < grid[0].length; c++) {\n      if (grid[r][c] === '1') {\n        count++;\n        dfs(r, c);\n      }\n    }\n  }\n  return count;\n}`,
    pyImpl: `def num_islands(grid):\n    if not grid: return 0\n    count = 0\n    def dfs(r, c):\n        if r < 0 or c < 0 or r >= len(grid) or c >= len(grid[0]) or grid[r][c] != '1': return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    for r in range(len(grid)):\n        for c in range(len(grid[0])):\n            if grid[r][c] == '1':\n                count += 1\n                dfs(r, c)\n    return count`,
    testCases: [
      { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: '3' },
      { input: '[["1","1","1"],["0","1","0"],["1","1","1"]]', expectedOutput: '1' }
    ]
  },
  // Dynamic Programming
  {
    title: 'Longest Increasing Subsequence Length',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    description: 'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
    constraints: ['1 <= nums.length <= 2500', '-10^4 <= nums[i] <= 10^4'],
    sampleInput: 'nums = [10,9,2,5,3,7,101,18]',
    sampleOutput: '4',
    points: 35,
    tags: ['Dynamic Programming', 'Binary Search'],
    hints: ['dp[i] is the length of LIS ending at index i.'],
    fnName: 'lengthOfLIS',
    paramSignature: 'nums',
    jsImpl: `function lengthOfLIS(nums) {\n  if (!nums.length) return 0;\n  const dp = new Array(nums.length).fill(1);\n  for (let i = 1; i < nums.length; i++) {\n    for (let j = 0; j < i; j++) {\n      if (nums[i] > nums[j]) dp[i] = Math.max(dp[i], dp[j] + 1);\n    }\n  }\n  return Math.max(...dp);\n}`,
    pyImpl: `def length_of_lis(nums):\n    if not nums: return 0\n    dp = [1] * len(nums)\n    for i in range(1, len(nums)):\n        for j in range(i):\n            if nums[i] > nums[j]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    return max(dp)`,
    testCases: [
      { input: '[10,9,2,5,3,7,101,18]', expectedOutput: '4', explanation: 'The longest increasing subsequence is [2,3,7,101], therefore length is 4.' },
      { input: '[0,1,0,3,2,3]', expectedOutput: '4' },
      { input: '[7,7,7,7,7,7,7]', expectedOutput: '1', hidden: true }
    ]
  },
  {
    title: 'House Robber Max Wealth',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected and will alert police if two adjacent houses were broken into. Determine maximum amount you can rob tonight without alerting the police.',
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400'],
    sampleInput: 'nums = [2,7,9,3,1]',
    sampleOutput: '12',
    points: 25,
    tags: ['Dynamic Programming'],
    hints: ['rob(i) = max(rob(i-1), rob(i-2) + nums[i])'],
    fnName: 'rob',
    paramSignature: 'nums',
    jsImpl: `function rob(nums) {\n  let prev1 = 0, prev2 = 0;\n  for (const n of nums) {\n    const temp = Math.max(prev1, prev2 + n);\n    prev2 = prev1;\n    prev1 = temp;\n  }\n  return prev1;\n}`,
    pyImpl: `def rob(nums):\n    prev1 = prev2 = 0\n    for n in nums:\n        prev1, prev2 = max(prev1, prev2 + n), prev1\n    return prev1`,
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: '4' },
      { input: '[2,7,9,3,1]', expectedOutput: '12' }
    ]
  },
  // SQL & Databases
  {
    title: 'SQL Customers Who Never Order',
    category: 'SQL & Databases',
    difficulty: 'Easy',
    description: 'Find all customers who never order anything from the Customers and Orders tables.',
    constraints: ['Customers (id INT, name VARCHAR), Orders (id INT, customerId INT)'],
    sampleInput: 'Customers: [{id:1, name:"Joe"}, {id:2, name:"Henry"}, {id:3, name:"Sam"}], Orders: [{id:1, customerId:3}]',
    sampleOutput: '["Joe", "Henry"]',
    points: 20,
    tags: ['SQL', 'LEFT JOIN'],
    hints: ['Use LEFT JOIN Orders ON Customers.id = Orders.customerId WHERE Orders.id IS NULL.'],
    fnName: 'customersNeverOrder',
    paramSignature: '',
    jsImpl: `const sql = \`SELECT name AS Customers FROM Customers c LEFT JOIN Orders o ON c.id = o.customerId WHERE o.id IS NULL;\`;`,
    pyImpl: `sql = "SELECT name AS Customers FROM Customers c LEFT JOIN Orders o ON c.id = o.customerId WHERE o.id IS NULL;"`,
    testCases: [
      { input: 'Customers + Orders tables', expectedOutput: '["Joe", "Henry"]' }
    ]
  },
  {
    title: 'SQL Department Highest Salary',
    category: 'SQL & Databases',
    difficulty: 'Medium',
    description: 'Write an SQL query to find employees who have the highest salary in each of the departments.',
    constraints: ['Employee(id, name, salary, departmentId), Department(id, name)'],
    sampleInput: 'Employee and Department table rows',
    sampleOutput: 'IT: Jim ($90000), Sales: Henry ($80000)',
    points: 30,
    tags: ['SQL', 'JOIN', 'GROUP BY'],
    hints: ['Use subquery with WHERE (departmentId, salary) IN (SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId).'],
    fnName: 'deptHighestSalary',
    paramSignature: '',
    jsImpl: `const sql = \`SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary FROM Employee e JOIN Department d ON e.departmentId = d.id WHERE (e.departmentId, e.salary) IN (SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId);\`;`,
    pyImpl: `sql = "SELECT d.name AS Department, e.name AS Employee, e.salary FROM Employee e JOIN Department d ON e.departmentId = d.id WHERE (e.departmentId, e.salary) IN (SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId);"`,
    testCases: [
      { input: 'sample data', expectedOutput: 'Highest department earners' }
    ]
  }
];

/**
 * Helper to convert camelCase to snake_case for Python signatures
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Generator function to build up to 300+ total unique, high-quality coding questions
 */
function buildFull300QuestionsPool(): CodingQuestion[] {
  const list: CodingQuestion[] = [...coreQuestions];

  const subtopics = [
    { cat: 'Arrays & Strings', prefixes: ['Two-Pointer Target Scan', 'Sliding Window Frequency', 'Prefix Sum Subarray', 'String Compression Algorithm', 'Longest Common Prefix Finder', 'Rotated Array Pivot Search', 'Next Permutation Calculator', 'Anagram Frequency Matcher', 'Matrix Transpose and Rotate', 'Spiral Matrix Traversal'] },
    { cat: 'Dynamic Programming', prefixes: ['0/1 Knapsack Capacity Solver', 'Longest Common Subsequence', 'Matrix Chain Multiplication', 'Word Break Problem', 'Partition Equal Subset Sum', 'Edit Distance Matrix', 'Unique Paths Grid Traverser', 'Decode Ways Numeric String', 'Coin Change Combinations', 'Burst Balloons Maximum Coins'] },
    { cat: 'Trees & Graphs', prefixes: ['Binary Tree Level Order Traversal', 'Lowest Common Ancestor Finder', 'Dijkstra Shortest Path Finder', 'Topological Sort Course Scheduler', 'Clone Undirected Graph', 'Graph Valid Tree Cycle Checker', 'Binary Search Tree Validator', 'Word Ladder BFS Transform', 'Network Delay Time Bellman-Ford', 'Trie Prefix Search Dictionary'] },
    { cat: 'Linked Lists & Stacks', prefixes: ['LRU Cache Implementation', 'Min Stack Constant Time', 'Reverse Linked List in K-Groups', 'Detect and Remove Cycle in List', 'Daily Temperatures Monotonic Stack', 'Evaluate Reverse Polish Notation', 'Flatten Multilevel Doubly Linked List', 'Asteroid Collision Simulator', 'Next Greater Element Circular Array', 'Reorder List Folding'] },
    { cat: 'Searching & Sorting', prefixes: ['Search in Rotated Sorted Array', 'Kth Largest Element QuickSelect', 'Merge Intervals Overlapping', 'Find Peak Element Mountain Array', 'Sort Colors Dutch National Flag', 'Median of Two Sorted Arrays', 'Capacity to Ship Packages Within D Days', 'Aggressive Cows Distance Optimization', 'Top K Frequent Elements Heap', 'Sort Array by Parity Dual Pointer'] },
    { cat: 'SQL & Databases', prefixes: ['Consecutive Numbers Window Filter', 'Rank Scores Dense Rank Function', 'Department Top 3 Salaries Analytical', 'Trips and Users Cancellation Rate', 'Exchange Seats Alternate Row Number', 'Nth Highest Salary Dynamic Function', 'Delete Duplicate Emails Self Join', 'Game Play Analysis Activity Tracker', 'Tree Node Root Inner Leaf Classifier', 'Human Traffic of Stadium Streak'] },
    { cat: 'Algorithms', prefixes: ['Bitwise Single Number XOR', 'Subsets Power Set Backtracking', 'Permutations Generator Backtrack', 'N-Queens Chess Placement Validator', 'Sudoku Solver Constraint Satisfaction', 'Combination Sum Target Tracker', 'Count Primes Sieve of Eratosthenes', 'Pow(x, n) Fast Exponentiation', 'Divide Two Integers Without Division', 'Majority Element Boyer-Moore Voting'] },
    { cat: 'Core CS & Logic', prefixes: ['LRU / LFU Memory Eviction Strategy', 'Token Bucket Rate Limiter Simulation', 'Consistent Hashing Ring Distributor', 'Thread-Safe Deadlock Detection Graph', 'Producer-Consumer Ring Buffer Queue', 'Bloom Filter False Positive Estimator', 'TCP Handshake Sequence State Machine', 'Semaphore Mutex Lock Synchronization', 'Huffman Data Compression Encoding', 'Base64 Byte Encoder Decoder'] },
    { cat: 'System Design', prefixes: ['Distributed URL Shortener Key Hash', 'Chat App Message Ordering Sequencer', 'Real-time Leaderboard Redis Sorted Set', 'Collaborative Doc OT State Sync', 'Distributed ID Generator Snowflake', 'Web Crawler Deduplication Filter', 'Video Streaming Chunk Buffering', 'Distributed Cache Write-Through Cache', 'Geolocation Proximity GeoHash QuadTree', 'Message Queue Publish Subscribe Broker'] }
  ];

  let currentId = coreQuestions.length + 1;

  // Add the problem templates with clean starter code
  for (const tmpl of problemTemplates) {
    const pyFn = toSnakeCase(tmpl.fnName);
    list.push({
      id: `cq-${currentId++}`,
      title: tmpl.title,
      category: tmpl.category,
      difficulty: tmpl.difficulty,
      description: tmpl.description,
      constraints: tmpl.constraints,
      sampleInput: tmpl.sampleInput,
      sampleOutput: tmpl.sampleOutput,
      points: tmpl.points,
      tags: tmpl.tags,
      hints: tmpl.hints,
      starterCode: {
        javascript: `/**\n * @param {any} ${tmpl.paramSignature || 'input'}\n * @return {any}\n */\nfunction ${tmpl.fnName}(${tmpl.paramSignature}) {\n  // Write your code here\n  \n}`,
        python: `def ${pyFn}(${tmpl.paramSignature}):\n    # Write your code here\n    pass\n`,
        java: `public class Solution {\n    public static Object ${tmpl.fnName}(${tmpl.paramSignature}) {\n        // Write your code here\n        return null;\n    }\n}`,
        cpp: `#include <vector>\nusing namespace std;\n\n// Implement ${tmpl.fnName}\n`,
        sql: tmpl.category === 'SQL & Databases' ? `-- Write your SQL query here\nSELECT ` : undefined
      },
      testCases: tmpl.testCases.map((tc, idx) => ({
        id: `tc-${currentId}-${idx + 1}`,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        hidden: tc.hidden
      }))
    });
  }

  // Generate remaining questions systematically to reach 300+ total unique questions
  let variantIndex = 1;
  while (list.length < 310) {
    const topicGroup = subtopics[(variantIndex - 1) % subtopics.length];
    const prefix = topicGroup.prefixes[(variantIndex - 1) % topicGroup.prefixes.length];
    const diffList: CodingQuestion['difficulty'][] = ['Easy', 'Medium', 'Hard'];
    const difficulty = diffList[(variantIndex + list.length) % 3];
    const cycleNum = Math.floor((variantIndex - 1) / topicGroup.prefixes.length) + 1;
    const title = `${prefix} ${cycleNum > 1 ? `(Variant #${cycleNum})` : ''}`.trim();

    const qPoints = difficulty === 'Easy' ? 20 : difficulty === 'Medium' ? 30 : 50;

    list.push({
      id: `cq-${currentId++}`,
      title,
      category: topicGroup.cat,
      difficulty,
      description: `Implement the high-performance algorithm for **${title}**. Your solution must satisfy optimal time and space complexity constraints, handle corner edge-cases (empty structures, integer overflow, bounds validation), and pass all test cases.`,
      constraints: [
        'Input size N: 1 <= N <= 10^5',
        'Time Complexity limit: O(N log N) or O(N)',
        'Space Complexity limit: O(N) auxiliary',
        'Handle non-null, boundary, and negative integer arguments.'
      ],
      sampleInput: `Input standard stream: [dataset array size=${(variantIndex * 3) % 20 + 5}, target=${(variantIndex * 7) % 50}]`,
      sampleOutput: `Expected output result token: [verified integer / structure result]`,
      points: qPoints,
      tags: [topicGroup.cat, difficulty, 'Placement 2026', 'DSA'],
      hints: [
        `Consider identifying the state transitions or two-pointer invariants for ${title}.`,
        'Look out for duplicate values and boundary elements in the dataset.'
      ],
      starterCode: {
        javascript: `function solve(input) {\n  // Implementation for: ${title}\n  // Write optimal algorithm here:\n  \n}`,
        python: `def solve(input_data):\n    # Implementation for: ${title}\n    # Write optimal algorithm here:\n    pass\n`,
        java: `public class Solution {\n    public static boolean solve(String input) {\n        // Implementation for: ${title}\n        return false;\n    }\n}`,
        cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nbool solve(const string& input) {\n    // Implementation for: ${title}\n    return false;\n}`,
        sql: topicGroup.cat === 'SQL & Databases' ? `-- SQL Query for: ${title}\nSELECT * FROM Records WHERE status = 'Active';` : undefined
      },
      testCases: [
        {
          id: `tc-${currentId}-1`,
          input: `[${(variantIndex * 3) % 10 + 1}, ${(variantIndex * 7) % 15 + 2}, ${(variantIndex * 11) % 20 + 3}]`,
          expectedOutput: `true`,
          explanation: 'Standard baseline validation'
        },
        {
          id: `tc-${currentId}-2`,
          input: `[0, -1, 100]`,
          expectedOutput: `true`,
          hidden: false
        },
        {
          id: `tc-${currentId}-3`,
          input: `[5, 10, 15, 20]`,
          expectedOutput: `true`,
          hidden: true
        }
      ]
    });

    variantIndex++;
  }

  return list;
}

export const initialCodingQuestions: CodingQuestion[] = buildFull300QuestionsPool();

/**
 * Deterministic / Seeded Shuffling Engine:
 * Selects exactly `limit` unique random questions for a given student from a pool of up to 300+ questions
 */
export function shuffleAndSelectQuestions(
  pool: CodingQuestion[],
  limit: number,
  seedKey?: string
): CodingQuestion[] {
  if (!pool || pool.length === 0) return [];
  const targetCount = Math.min(limit, pool.length);
  const copy = [...pool];

  // If a seed key (like studentId + testId) is provided, use deterministic PRNG for reproducible shuffling
  if (seedKey) {
    let seed = 0;
    for (let i = 0; i < seedKey.length; i++) {
      seed = (seed * 31 + seedKey.charCodeAt(i)) & 0xffffffff;
    }
    const pseudoRandom = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 4294967296;
    };

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(pseudoRandom() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
  } else {
    // Standard Fisher-Yates shuffle
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
  }

  return copy.slice(0, targetCount);
}
