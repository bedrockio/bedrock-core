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
          // Update the "secret" of the password
          // authenticator to be the new password.
          authenticators: {
            $map: {
              input: '$authenticators',
              as: 'authenticator',
              in: {
                $cond: {
                  if: {
                    $eq: ['$$authenticator.type', 'password'],
                  },
                  then: {
                    $mergeObjects: [
                      '$$authenticator',
                      {
                        secret: {
                          $literal: hashedPassword,
                        },
                      },
                    ],
                  },
                  else: '$$authenticator',
                },
              },
            },
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
