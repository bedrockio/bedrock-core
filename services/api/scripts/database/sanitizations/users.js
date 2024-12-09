// Note that this is an example of a complex sanitization pipeline.
// For a simple case the "sanitize" key can be set on individual fields
// in a model definition:

// - When `true` the value will be stripped from all documents.
// - When a string the value will be set to a literal for all documents.

const bcrypt = require('bcrypt');

// Development password. Note this is hard
// coded as this will be run on the actual
// CLI deploymenet pod.
const DEV_PASSWORD = 'development.now';

module.exports = async () => {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(DEV_PASSWORD, salt);

  return {
    collection: 'users',
    pipeline: [
      // Tag admins
      {
        $set: {
          isAdmin: {
            $anyElementTrue: {
              $map: {
                input: '$roles',
                as: 'role',
                in: {
                  $in: ['$$role.role', ['superAdmin', 'admin', 'viewer']],
                },
              },
            },
          },
        },
      },
      // Obfuscate email/lastName if not admin.
      // Set password to dev password for all.
      {
        $set: {
          email: {
            $cond: {
              if: '$isAdmin',
              then: '$email',
              else: {
                $concat: [
                  {
                    $toString: '$_id',
                  },
                  '@bedrock.foundation',
                ],
              },
            },
          },
          lastName: {
            $cond: {
              if: '$isAdmin',
              then: '$lastName',
              else: 'Doe',
            },
          },
          hashedPassword: {
            $literal: hashedPassword,
          },
        },
      },
      // Unset sensitive fields if any.
      // {
      //   $unset: ['dob'],
      // },
      {
        $unset: 'isAdmin',
      },
    ],
  };
};
